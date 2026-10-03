import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const searchFriends = async (req: Request, res: Response) => {
  const query = req.query.q as string;
  if (!query) return res.status(400).json({ error: 'Search query required' });

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { full_name: { contains: query, mode: 'insensitive' } },
          { registration_number: { equals: query } }
        ]
      },
      select: { id: true, full_name: true, registration_number: true }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const sendFriendRequest = async (req: Request, res: Response) => {
  const { addressee_id } = req.body;
  const requester_id = (req as any).user?.id;

  if (!requester_id || !addressee_id) {
    return res.status(400).json({ error: 'Missing requester or addressee' });
  }

  try {
    const friendship = await prisma.friendship.create({
      data: {
        requester_id,
        addressee_id,
        status: 'PENDING'
      }
    });
    res.json(friendship);
  } catch (err) {
    res.status(500).json({ error: 'Error sending request. Request may already exist.' });
  }
};

export const respondToFriendRequest = async (req: Request, res: Response) => {
  const { friendship_id, accept } = req.body;
  const user_id = (req as any).user?.id;

  try {
    const friendship = await prisma.friendship.findUnique({ where: { id: friendship_id } });
    
    if (!friendship || friendship.addressee_id !== user_id) {
      return res.status(403).json({ error: 'Unauthorized to respond to this request' });
    }

    const updated = await prisma.friendship.update({
      where: { id: friendship_id },
      data: { status: accept ? 'ACCEPTED' : 'DECLINED' },
      include: { addressee: true }
    });

    // Notify only if accepted (Silent Drop Rule)
    if (accept) {
      const io = req.app.get('io');
      io.to(`user_${friendship.requester_id}`).emit('friend_request_accepted', {
        friendship_id: updated.id,
        friend_name: updated.addressee.full_name
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error responding to request' });
  }
};
