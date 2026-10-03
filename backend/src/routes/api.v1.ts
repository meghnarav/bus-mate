import { Router } from 'express';
import { googleSSOLogin } from '../controllers/auth.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

// --- AUTHENTICATION ---
router.post('/auth/google', googleSSOLogin);

// --- PROTECTED ROUTES (Example) ---
router.get('/me', requireAuth, (req: any, res) => {
  res.json({ user: req.user });
});

// --- DRIVER/ADMIN ONLY ROUTES ---
router.post('/qr/scan', requireAuth, requireRole(['DRIVER', 'ADMIN']), (req, res) => {
  // Logic to call DynamicQREngine and validate
  res.json({ success: true, message: 'Scan endpoint hit securely' });
});

export default router;
