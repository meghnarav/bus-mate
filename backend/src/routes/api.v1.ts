import { Router } from 'express';
import { googleSSOLogin } from '../controllers/auth.controller';
import { reserveSeats, confirmBooking } from '../controllers/booking.controller';
import { validateQR } from '../controllers/qr.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { searchFriends, sendFriendRequest, respondToFriendRequest } from '../controllers/friends.controller';
import { createGroupBooking, inviteToGroup, respondToGroupInvite } from '../controllers/groups.controller';

const router = Router();

// --- AUTHENTICATION ---
router.post('/auth/google', googleSSOLogin);

// --- PROTECTED ROUTES (Passengers) ---
router.post('/booking/reserve', requireAuth, reserveSeats);
router.post('/booking/confirm', requireAuth, confirmBooking);

// --- FRIENDS MODULE ---
router.get('/friends/search', requireAuth, searchFriends);
router.post('/friends/request', requireAuth, sendFriendRequest);
router.post('/friends/respond', requireAuth, respondToFriendRequest);

// --- GROUP BOOKING MODULE ---
router.post('/groups/create', requireAuth, createGroupBooking);
router.post('/groups/invite', requireAuth, inviteToGroup);
router.post('/groups/respond', requireAuth, respondToGroupInvite);

// --- DRIVER/ADMIN ONLY ROUTES ---
router.post('/qr/scan', requireAuth, requireRole(['DRIVER', 'ADMIN']), validateQR);

export default router;
