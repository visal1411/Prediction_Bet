import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const createMarket = async (req: Request, res: Response) => {
  try {
    const { 
      sport, league, teamHome, teamAway, 
      eventDate, deadline, marketAddress 
    } = req.body;

    const event = await prisma.event.create({
      data: {
        sport,
        league,
        teamHome,
        teamAway,
        eventDate: new Date(eventDate),
        status: 'open',
        marketAddress,
      }
    });

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create market' });
  }
};

export const resolveMarket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { winningOutcome } = req.body;

    const event = await prisma.event.update({
      where: { id },
      data: { 
        status: 'resolved',
        result: winningOutcome
      },
    });

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to resolve market' });
  }
};

export const updateMarketStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const event = await prisma.event.update({
      where: { id },
      data: { status },
    });

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update market status' });
  }
};
