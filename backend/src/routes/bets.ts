import { Router } from 'express';
import { getBetHistory, getActiveBets } from '../controllers/betsController';

const router = Router();

router.get('/history', getBetHistory);
router.get('/active', getActiveBets);

export default router;
