import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletContextValue {
  account: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask is not installed. Please install it to use this feature.');
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (error) {
      console.error('Failed to connect to MetaMask:', error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    // MetaMask doesn't have a true "disconnect" method that we can call to log them out of the extension,
    // so we just clear our local state.
    setAccount(null);
  }, []);

  // Set up event listeners for MetaMask account/chain changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet from the dApp via MetaMask UI
          setAccount(null);
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        // Recommend reloading the page when the chain changes
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Check if already connected on mount
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      }).catch(console.error);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return (
    <WalletContext.Provider value={{ account, isConnecting, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
