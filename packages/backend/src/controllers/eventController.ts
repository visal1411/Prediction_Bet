import { Request, Response, NextFunction } from 'express';
import * as eventService from '../services/eventService';

export async function listEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sport, status, isLive } = req.query as Record<string, string>;
    const filters = {
      sport: sport || undefined,
      status: status || undefined,
      isLive: isLive !== undefined ? isLive === 'true' : undefined,
    };
    const events = await eventService.getAllEvents(filters);
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
}

export async function getEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const detail = await eventService.getEventById(id);
    res.json({ success: true, data: detail });
  } catch (err) {
    next(err);
  }
}

export async function getEventOdds(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const odds = await eventService.getEventOdds(id);
    res.json({ success: true, data: odds });
  } catch (err) {
    next(err);
  }
}
