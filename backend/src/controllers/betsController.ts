import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getBetHistory = async (req: Request, res: Response) => {
  try {
    const { wallet } = req.query;
    
    if (!wallet) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const bets = await prisma.bet.findMany({
      where: { walletAddress: String(wallet) },
      include: { event: true },
      orderBy: { createdAt: 'desc' },
    });
    
    res.json(bets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch bet history' });
  }
};

export const getActiveBets = async (req: Request, res: Response) => {
  try {
    const { wallet } = req.query;
    
    if (!wallet) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const bets = await prisma.bet.findMany({
      where: { 
        walletAddress: String(wallet),
        status: 'confirmed' // Or whatever status means active
      },
      include: { event: true },
      orderBy: { createdAt: 'desc' },
    });
    
    res.json(bets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch active bets' });
  }
};
