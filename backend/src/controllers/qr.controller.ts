import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { DynamicQREngine } from '../services/dynamic-qr.service';

const prisma = new PrismaClient();
const qrEngine = new DynamicQREngine();

export const validateQR = async (req: Request, res: Response) => {
  try {
    const { ticketId, timeStep, hmacHash } = req.body;

    if (!ticketId || !timeStep || !hmacHash) {
      return res.status(400).json({ error: 'Invalid QR payload' });
    }

    // Find the ticket and the user info
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { user: true }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Anti-passback: Only allow 'ISSUED' tickets to be boarded
    if (ticket.status === 'BOARDED') {
      return res.status(403).json({ error: 'Ticket has already been used (Boarded)' });
    }
    if (ticket.status === 'CANCELLED') {
      return res.status(403).json({ error: 'Ticket was cancelled' });
    }

    // Validate the HMAC payload
    const isValid = qrEngine.validateQR(ticket.qr_seed_token, hmacHash, Number(timeStep));

    if (!isValid) {
      return res.status(401).json({ error: 'QR Code is expired or invalid' });
    }

    // Update ticket to BOARDED atomically
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'BOARDED' }
    });

    return res.status(200).json({
      success: true,
      message: 'Boarding successful',
      passengerName: ticket.user.full_name,
      seatNumber: ticket.seat_number
    });

  } catch (error) {
    console.error('QR Validation Error:', error);
    return res.status(500).json({ error: 'Internal server error during validation' });
  }
};
