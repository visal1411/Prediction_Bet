import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { status, sport, isDemo } = req.query;
    
    // Build query
    const where: any = {};
    if (status) where.status = String(status);
    if (sport) where.sport = String(sport);
    if (isDemo !== undefined) where.isDemo = isDemo === 'true';

    const events = await prisma.event.findMany({
      where,
      orderBy: { eventDate: 'asc' },
    });
    
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { id },
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};
