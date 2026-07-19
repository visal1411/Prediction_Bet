import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const verifySchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'invalid wallet address'),
  signature: z.string().min(1, 'signature is required'),
});

// GET /api/auth/nonce?wallet=0x...
router.get('/nonce', authController.getNonce);

// POST /api/auth/verify
router.post('/verify', validateBody(verifySchema), authController.verifySignature);

export default router;
