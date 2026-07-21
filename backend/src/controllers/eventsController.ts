import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { status, sport } = req.query;

    // Build query
    const where: any = {};
    if (status) where.status = String(status);
    if (sport) where.sport = String(sport);

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
      include: {
        bets: {
          orderBy: { createdAt: 'desc' } // Optional: puts newest bets at the top!
        }
      }
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

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { sport, league, teamHome, teamAway, eventDate, externalApiId, marketAddress, status } = req.body;

    const newEvent = await prisma.event.create({
      data: {
        sport,
        league,
        teamHome,
        teamAway,
        eventDate: new Date(eventDate),
        externalApiId,
        marketAddress,
        status: status || 'open',
      }
    });

    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

export const getEventBets = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bets = await prisma.bet.findMany({
      where: { eventId: id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bets);
  } catch (error) {
    console.error('Error fetching event bets:', error);
    res.status(500).json({ error: 'Failed to fetch event bets' });
  }
};
