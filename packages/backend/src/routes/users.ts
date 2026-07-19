import { Router } from 'express';
import * as userController from '../controllers/userController';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  avatarUrl: z.string().url().optional(),
});

// GET /api/users/leaderboard
// Note: Put this before /:wallet to avoid 'leaderboard' being treated as a wallet address
router.get('/leaderboard', userController.getLeaderboard);

// GET /api/users/:wallet
router.get('/:wallet', userController.getUser);

// PUT /api/users/:wallet
router.put('/:wallet', validateBody(updateUserSchema), userController.updateUser);

export default router;
