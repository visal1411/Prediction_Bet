import { Request, Response, NextFunction } from 'express';
import * as betService from '../services/betService';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

export async function getBetHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { wallet } = req.query as { wallet?: string };
    if (!wallet) throw createError('wallet query parameter is required', 400);
    const bets = await betService.getBetHistory(wallet);
    res.json({ success: true, data: bets });
  } catch (err) {
    next(err);
  }
}

export async function getActiveBets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { wallet } = req.query as { wallet?: string };
    if (!wallet) throw createError('wallet query parameter is required', 400);
    const bets = await betService.getActiveBets(wallet);
    res.json({ success: true, data: bets });
  } catch (err) {
    next(err);
  }
}

export async function placeBet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { eventId, marketOptionId, stake, walletAddress, txHash } = req.body;

    // Ensure the authenticated wallet matches the request wallet
    if (req.walletAddress && req.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw createError('Wallet address mismatch', 403);
    }

    const bet = await betService.placeBet({ eventId, marketOptionId, stake, walletAddress, txHash });
    res.status(201).json({ success: true, data: bet });
  } catch (err) {
    next(err);
  }
}
