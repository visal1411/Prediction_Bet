import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';

export async function getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { wallet } = req.params;
    const user = await userService.getOrCreateUser(wallet);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { wallet } = req.params;
    const { username, avatarUrl } = req.body;
    const user = await userService.updateUserProfile(wallet, { username, avatarUrl });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const leaderboard = await userService.getLeaderboard(limit);
    res.json({ success: true, data: leaderboard });
  } catch (err) {
    next(err);
  }
}
