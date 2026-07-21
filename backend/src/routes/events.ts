import { Router } from 'express';
import { getEvents, getEventById, createEvent, getEventBets } from '../controllers/eventsController';

const router = Router();

router.get('/', getEvents);
router.post('/', createEvent);
router.get('/:id', getEventById);
router.get('/:id/bets', getEventBets);

export default router;
