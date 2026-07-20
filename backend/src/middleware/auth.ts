import { Request, Response, NextFunction } from 'express';

// Simple mock auth for this demo.
// In reality, we'd verify a signed message using ethers.js
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (process.env.NODE_ENV === 'development') {
    return next(); // bypass auth in dev for easier testing
  }

  // Very basic mock check
  if (authHeader && authHeader === process.env.ADMIN_WALLET_ADDRESS) {
    return next();
  }

  return res.status(403).json({ error: 'Unauthorized: Admin only' });
};
