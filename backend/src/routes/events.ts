import { Router } from 'express';
import { getEvents, getEventById } from '../controllers/eventsController';

const router = Router();

router.get('/', getEvents);
router.get('/:id', getEventById);

export default router;
