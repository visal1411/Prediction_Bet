import { Router } from 'express';
import { createDemoMarket, resolveDemoMarket } from '../controllers/adminController';
// import { requireAdmin } from '../middleware/auth'; // For the future when auth is implemented

const router = Router();

// In a real app we'd attach a middleware to enforce that the caller is the contract owner
// router.use(requireAdmin); 

router.post('/demo', createDemoMarket);
router.post('/demo/:id/resolve', resolveDemoMarket);

export default router;
