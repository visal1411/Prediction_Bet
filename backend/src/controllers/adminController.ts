import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const createDemoMarket = async (req: Request, res: Response) => {
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
        isDemo: true,
        status: 'open',
        marketAddress,
      }
    });

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create demo market' });
  }
};

export const resolveDemoMarket = async (req: Request, res: Response) => {
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
    res.status(500).json({ error: 'Failed to resolve demo market' });
  }
};
