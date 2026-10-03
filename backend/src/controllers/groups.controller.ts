import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createGroupBooking = async (req: Request, res: Response) => {
  const { schedule_id, booking_date } = req.body;
  const initiator_id = (req as any).user?.id;

  if (!initiator_id || !booking_date) {
    return res.status(400).json({ error: 'Missing initiator or booking_date' });
  }

  try {
    const group = await prisma.bookingGroup.create({
      data: {
        initiator_user_id: initiator_id,
        schedule_id: schedule_id || null,
        booking_date: new Date(booking_date),
        invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        status: 'OPEN'
      }
    });

    // Add initiator as first member
    await prisma.groupMember.create({
      data: {
        group_id: group.id,
        user_id: initiator_id,
        status: 'ACCEPTED'
      }
    });

    res.json(group);
  } catch (err) {
    res.status(500).json({ error: 'Error creating group booking' });
  }
};

export const inviteToGroup = async (req: Request, res: Response) => {
  const { group_id, friend_user_id } = req.body;
  const initiator_id = (req as any).user?.id;

  try {
    // 1. Verify Friendship is ACCEPTED
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requester_id: initiator_id, addressee_id: friend_user_id, status: 'ACCEPTED' },
          { requester_id: friend_user_id, addressee_id: initiator_id, status: 'ACCEPTED' }
        ]
      }
    });

    if (!friendship) {
      return res.status(403).json({ error: 'Can only invite accepted friends' });
    }

    // 2. Create Pending Member
    const member = await prisma.groupMember.create({
      data: {
        group_id,
        user_id: friend_user_id,
        status: 'PENDING'
      }
    });

    res.json(member);
  } catch (err) {
    res.status(500).json({ error: 'Error inviting friend' });
  }
};

export const respondToGroupInvite = async (req: Request, res: Response) => {
  const { group_id, accept } = req.body;
  const user_id = (req as any).user?.id;

  try {
    const member = await prisma.groupMember.findFirst({
      where: { group_id, user_id, status: 'PENDING' }
    });

    if (!member) {
      return res.status(404).json({ error: 'No pending invite found' });
    }

    const updated = await prisma.groupMember.update({
      where: { id: member.id },
      data: { status: accept ? 'ACCEPTED' : 'DECLINED' }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error responding to group invite' });
  }
};
