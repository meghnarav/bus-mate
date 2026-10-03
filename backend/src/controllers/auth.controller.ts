import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key';

export const googleSSOLogin = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Google ID token is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google Token' });
    }

    const email = payload.email;
    const name = payload.name || 'VIT User';
    const googleId = payload.sub;

    // Strict validation for vit.ac.in domain
    if (!email.endsWith('@vit.ac.in') && !email.endsWith('@vitstudent.ac.in')) {
      return res.status(403).json({ error: 'Only VIT University emails are allowed.' });
    }

    // Determine role based on email domain
    let role: 'STUDENT' | 'FACULTY' | 'ADMIN' = 'STUDENT';
    let tier: 'STANDARD' | 'PRIORITY' = 'STANDARD';

    if (email.endsWith('@vit.ac.in')) {
      role = 'FACULTY'; // Assuming @vit.ac.in is for faculty/staff
      tier = 'PRIORITY';
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          full_name: name,
          google_id: googleId,
          role,
          tier,
        },
      });
    } else if (!user.google_id) {
      // Link Google account to existing user
      user = await prisma.user.update({
        where: { email },
        data: { google_id: googleId },
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, tier: user.tier },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role,
        tier: user.tier,
      }
    });

  } catch (error) {
    console.error('Google SSO Error:', error);
    return res.status(500).json({ error: 'Internal Server Error during SSO' });
  }
};
