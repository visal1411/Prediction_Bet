import { Router } from 'express';
import * as betController from '../controllers/betController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const placeBetSchema = z.object({
  eventId: z.string().min(1, 'eventId is required'),
  marketOptionId: z.string().min(1, 'marketOptionId is required'),
  stake: z.number().positive('stake must be positive'),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'invalid wallet address'),
  txHash: z.string().optional(),
});

// GET /api/bets/history?wallet=0x...
router.get('/history', betController.getBetHistory);

// GET /api/bets/active?wallet=0x...
router.get('/active', betController.getActiveBets);

// POST /api/bets  (auth optional — allows unauth demo bets but records wallet from body)
router.post('/', optionalAuth, validateBody(placeBetSchema), betController.placeBet);

export default router;
