import { Router } from 'express';
import * as eventController from '../controllers/eventController';

const router = Router();

// GET /api/events?sport=football&status=upcoming&isLive=true
router.get('/', eventController.listEvents);

// GET /api/events/:id
router.get('/:id', eventController.getEvent);

// GET /api/events/:id/odds
router.get('/:id/odds', eventController.getEventOdds);

export default router;
