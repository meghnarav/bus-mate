import { Router } from 'express';
import { googleSSOLogin } from '../controllers/auth.controller';
import { reserveSeats, confirmBooking } from '../controllers/booking.controller';
import { validateQR } from '../controllers/qr.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

// --- AUTHENTICATION ---
router.post('/auth/google', googleSSOLogin);

// --- PROTECTED ROUTES (Passengers) ---
router.post('/booking/reserve', requireAuth, reserveSeats);
router.post('/booking/confirm', requireAuth, confirmBooking);

// --- DRIVER/ADMIN ONLY ROUTES ---
router.post('/qr/scan', requireAuth, requireRole(['DRIVER', 'ADMIN']), validateQR);

export default router;
