import { Request, Response } from 'express';
import { SeatAllocationEngine } from '../services/seat-allocation.service';
import { AuthRequest } from '../middleware/auth.middleware';
import crypto from 'crypto';

const seatEngine = new SeatAllocationEngine();

export const reserveSeats = async (req: AuthRequest, res: Response) => {
  try {
    const { scheduleId, busId, groupSize, preferredRow } = req.body;
    
    if (!scheduleId || !busId || !groupSize) {
      return res.status(400).json({ error: 'Missing required fields: scheduleId, busId, groupSize' });
    }

    // Try to allocate seats via the engine
    const allocationResult = await seatEngine.allocateSeats(scheduleId, busId, groupSize, preferredRow);

    if (!allocationResult.success) {
      return res.status(409).json({ error: allocationResult.error });
    }

    return res.status(200).json({
      success: true,
      message: 'Seats temporarily reserved for 5 minutes',
      token: allocationResult.token,
      seatNumbers: allocationResult.seatNumbers,
      expiresIn: 300 // seconds
    });
  } catch (error) {
    console.error('Seat reservation error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const confirmBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { scheduleId, seatNumbers, lockToken } = req.body;
    const userId = req.user!.userId;

    if (!scheduleId || !seatNumbers || !lockToken) {
      return res.status(400).json({ error: 'Missing confirmation parameters' });
    }

    // Generate unique crypto seeds for each ticket
    const qrSeedTokens = seatNumbers.map(() => crypto.randomBytes(32).toString('hex'));

    const isFinalized = await seatEngine.finalizeBooking(
      userId,
      scheduleId,
      seatNumbers,
      lockToken,
      qrSeedTokens
    );

    if (!isFinalized) {
      return res.status(400).json({ error: 'Booking failed. Lock token expired or invalid.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking confirmed',
      seats: seatNumbers,
      // In production, these should only be sent securely to the client's keystore once
      qrSeeds: qrSeedTokens
    });
  } catch (error) {
    console.error('Confirm booking error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
