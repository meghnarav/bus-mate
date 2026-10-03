import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import crypto from 'crypto';

const prisma = new PrismaClient();
const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redisClient.connect().catch(console.error);

export class SeatAllocationEngine {
  /**
   * Attempts to allocate contiguous seats for a group.
   */
  async allocateSeats(
    scheduleId: string,
    busId: string,
    groupSize: number,
    preferredRow?: number
  ): Promise<{ success: boolean; seatNumbers?: number[]; token?: string; error?: string }> {
    if (groupSize < 1 || groupSize > 6) {
      return { success: false, error: 'Group size must be between 1 and 6.' };
    }

    // 1. Fetch Bus config to know rows and columns
    const bus = await prisma.bus.findUnique({ where: { id: busId } });
    if (!bus) return { success: false, error: 'Bus not found.' };

    const { rows, columns, total_capacity } = bus;

    // 2. Fetch existing tickets for this schedule to find reserved/issued/boarded seats
    const existingTickets = await prisma.ticket.findMany({
      where: {
        schedule_id: scheduleId,
        status: { in: ['RESERVED', 'ISSUED', 'BOARDED'] },
      },
      select: { seat_number: true },
    });
    
    const dbReservedSeats = new Set(existingTickets.map((t) => t.seat_number));

    // 3. Find available contiguous seats
    let allocatedSeats: number[] = [];
    
    // Simple contiguous search in the same row
    for (let r = preferredRow || 1; r <= rows; r++) {
      let consecutiveAvailable = 0;
      let tempSeats: number[] = [];
      
      for (let c = 1; c <= columns; c++) {
        const seatNum = (r - 1) * columns + c;
        
        // Also check if seat is locked in Redis
        const isLocked = await redisClient.get(`LOCK:seat:${scheduleId}:${seatNum}`);
        
        if (!dbReservedSeats.has(seatNum) && !isLocked) {
          consecutiveAvailable++;
          tempSeats.push(seatNum);
          if (consecutiveAvailable === groupSize) {
            allocatedSeats = tempSeats;
            break;
          }
        } else {
          consecutiveAvailable = 0;
          tempSeats = [];
        }
      }
      if (allocatedSeats.length > 0) break;
    }
    
    // Fallback: If not found in the same row, find any adjacent seats across rows
    if (allocatedSeats.length === 0) {
      for (let i = 1; i <= total_capacity; i++) {
        const isLocked = await redisClient.get(`LOCK:seat:${scheduleId}:${i}`);
        if (!dbReservedSeats.has(i) && !isLocked) {
          allocatedSeats.push(i);
          if (allocatedSeats.length === groupSize) break;
        }
      }
    }
    
    if (allocatedSeats.length < groupSize) {
      return { success: false, error: 'Not enough available seats.' };
    }

    // 4. Acquire Redis distributed lock for selected seats (300s TTL)
    const lockToken = crypto.randomUUID();
    const multi = redisClient.multi();
    
    for (const seatNum of allocatedSeats) {
      // Use NX (Not eXists) to ensure we actually acquire the lock
      multi.set(`LOCK:seat:${scheduleId}:${seatNum}`, lockToken, {
        EX: 300,
        NX: true
      });
    }
    
    const results = await multi.exec();
    
    // Verify all locks were acquired
    if (results.includes(null)) {
      // Failed to acquire all locks, rollback any we might have grabbed (though NX multi behavior usually prevents partials if we checked right before, race conditions can happen)
      for (const seatNum of allocatedSeats) {
         await redisClient.del(`LOCK:seat:${scheduleId}:${seatNum}`);
      }
      return { success: false, error: 'Seats were taken during checkout process. Try again.' };
    }

    return { 
      success: true, 
      seatNumbers: allocatedSeats, 
      token: lockToken 
    };
  }

  /**
   * Finalizes the booking by converting Redis locks to DB tickets.
   */
  async finalizeBooking(
    userId: string,
    scheduleId: string,
    seatNumbers: number[],
    lockToken: string,
    qrSeedTokens: string[]
  ): Promise<boolean> {
    try {
      // Use transaction to ensure atomicity
      await prisma.$transaction(async (tx) => {
        for (let i = 0; i < seatNumbers.length; i++) {
          const seatNum = seatNumbers[i];
          const qrSeed = qrSeedTokens[i];
          
          // Verify lock is still held by this user/token
          const currentLock = await redisClient.get(`LOCK:seat:${scheduleId}:${seatNum}`);
          if (currentLock !== lockToken) {
            throw new Error(`Lock expired or invalid for seat ${seatNum}`);
          }
          
          // Create permanent ticket
          await tx.ticket.create({
            data: {
              user_id: userId,
              schedule_id: scheduleId,
              seat_number: seatNum,
              qr_seed_token: qrSeed, // Should be encrypted before this step
              status: 'ISSUED'
            }
          });
          
          // Release Redis lock since it's now in DB
          await redisClient.del(`LOCK:seat:${scheduleId}:${seatNum}`);
        }
      });
      return true;
    } catch (error) {
      console.error('Finalization error:', error);
      return false;
    }
  }
}
