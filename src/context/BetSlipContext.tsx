import React, { createContext, useContext, useState, useCallback } from 'react';

export interface BetSelection {
  id: string;          // unique key e.g. "match-1-win1"
  matchId: number;
  matchLabel: string;  // "Manchester Utd vs Arsenal"
  sport: string;       // "FOOTBALL"
  market: string;      // "Full Time Result"
  selection: string;   // "Manchester Utd"
  odds: number;
  stake: number;
}

interface BetSlipContextValue {
  selections: BetSelection[];
  addBet: (bet: Omit<BetSelection, 'stake'>) => void;
  removeBet: (id: string) => void;
  updateStake: (id: string, stake: number) => void;
  clearAll: () => void;
  hasBet: (id: string) => boolean;
  totalStake: number;
  totalOdds: number;
  potentialPayout: number;
  isOpen: boolean;
  toggleOpen: () => void;
}

const BetSlipContext = createContext<BetSlipContextValue | null>(null);

export function BetSlipProvider({ children }: { children: React.ReactNode }) {
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  const addBet = useCallback((bet: Omit<BetSelection, 'stake'>) => {
    setSelections(prev => {
      // If already selected, remove it (toggle off)
      if (prev.find(s => s.id === bet.id)) {
        return prev.filter(s => s.id !== bet.id);
      }
      return [...prev, { ...bet, stake: 10 }];
    });
  }, []);

  const removeBet = useCallback((id: string) => {
    setSelections(prev => prev.filter(s => s.id !== id));
  }, []);

  const updateStake = useCallback((id: string, stake: number) => {
    setSelections(prev => prev.map(s => s.id === id ? { ...s, stake } : s));
  }, []);

  const clearAll = useCallback(() => setSelections([]), []);

  const hasBet = useCallback((id: string) => selections.some(s => s.id === id), [selections]);

  const totalStake = selections.reduce((sum, s) => sum + s.stake, 0);
  const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1);
  const potentialPayout = selections.reduce((sum, s) => sum + s.stake * s.odds, 0);

  return (
    <BetSlipContext.Provider value={{
      selections, addBet, removeBet, updateStake, clearAll, hasBet,
      totalStake, totalOdds, potentialPayout, isOpen, toggleOpen: () => setIsOpen(v => !v),
    }}>
      {children}
    </BetSlipContext.Provider>
  );
}

export function useBetSlip() {
  const ctx = useContext(BetSlipContext);
  if (!ctx) throw new Error('useBetSlip must be used within BetSlipProvider');
  return ctx;
}
