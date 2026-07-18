// Simple middleware to simulate wallet authentication.
// In production, require signature verification (Personal Sign)

export const authWallet = (req, res, next) => {
  const walletAddress = req.header("x-wallet-address");
  if (!walletAddress) {
    return res.status(401).json({ error: "No wallet address provided in headers" });
  }
  
  req.walletAddress = walletAddress.toLowerCase();
  next();
};

export const requireAdmin = (req, res, next) => {
  // Mock simple admin check
  const adminWallet = process.env.ADMIN_WALLET || "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
  if (req.walletAddress !== adminWallet.toLowerCase()) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
