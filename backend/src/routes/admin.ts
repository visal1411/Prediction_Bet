import { Router } from 'express';
import { createMarket, resolveMarket, updateMarketStatus } from '../controllers/adminController';
// import { requireAdmin } from '../middleware/auth'; // For the future when auth is implemented

const router = Router();

// In a real app we'd attach a middleware to enforce that the caller is the contract owner
// router.use(requireAdmin); 

router.post('/markets', createMarket);
router.post('/markets/:id/resolve', resolveMarket);
router.post('/markets/:id/status', updateMarketStatus);

export default router;
