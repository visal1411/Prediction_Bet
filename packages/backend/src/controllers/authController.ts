import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { env } from '../config/env';
import { createError } from '../middleware/errorHandler';
import * as userService from '../services/userService';

const NONCE_TTL_MINUTES = 10;

// GET /api/auth/nonce?wallet=0x...
export async function getNonce(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const wallet = (req.query.wallet as string)?.toLowerCase();
    if (!wallet || !wallet.startsWith('0x')) {
      throw createError('Valid wallet address required', 400);
    }

    // Ensure user row exists
    await userService.getOrCreateUser(wallet);

    // Generate a unique nonce
    const nonce = uuidv4();
    const expiresAt = new Date(Date.now() + NONCE_TTL_MINUTES * 60 * 1000);

    // Invalidate previous unused nonces for this wallet
    await prisma.authNonce.updateMany({
      where: { walletAddress: wallet, used: false },
      data: { used: true },
    });

    await prisma.authNonce.create({
      data: { walletAddress: wallet, nonce, expiresAt },
    });

    const message = `Welcome to Sport Betting DApp!\n\nSign this message to authenticate.\n\nNonce: ${nonce}\nExpires: ${expiresAt.toISOString()}`;

    res.json({
      success: true,
      data: { nonce, message },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/verify  { walletAddress, signature }
export async function verifySignature(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { walletAddress, signature } = req.body as { walletAddress: string; signature: string };

    if (!walletAddress || !signature) {
      throw createError('walletAddress and signature are required', 400);
    }

    const wallet = walletAddress.toLowerCase();

    // Find the latest valid nonce for this wallet
    const nonceRecord = await prisma.authNonce.findFirst({
      where: {
        walletAddress: wallet,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { expiresAt: 'desc' },
    });

    if (!nonceRecord) {
      throw createError('Nonce not found or expired. Please request a new nonce.', 401);
    }

    // Reconstruct the message and verify the signature
    const message = `Welcome to Sport Betting DApp!\n\nSign this message to authenticate.\n\nNonce: ${nonceRecord.nonce}\nExpires: ${nonceRecord.expiresAt.toISOString()}`;

    let recoveredAddress: string;
    try {
      recoveredAddress = ethers.verifyMessage(message, signature);
    } catch {
      throw createError('Invalid signature', 401);
    }

    if (recoveredAddress.toLowerCase() !== wallet) {
      throw createError('Signature does not match wallet address', 401);
    }

    // Mark nonce as used
    await prisma.authNonce.update({
      where: { id: nonceRecord.id },
      data: { used: true },
    });

    // Get or create user profile
    const user = await userService.getOrCreateUser(wallet);

    // Issue JWT
    const token = jwt.sign(
      { walletAddress: wallet },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    res.json({
      success: true,
      data: { token, user },
    });
  } catch (err) {
    next(err);
  }
}
