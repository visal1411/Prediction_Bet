import { ShoppingBag, X, Trash2, ChevronRight, Loader2 } from 'lucide-react';
import { useBetSlip } from '../../context/BetSlipContext';
import { useState } from 'react';
import { ethers } from 'ethers';
import PredictionMarketArtifact from '../../abi/PredictionMarket.json';

const QUICK_STAKES = [5, 10, 25, 50];

export default function BetSlip() {
  const {
    selections, removeBet, updateStake, clearAll,
    totalStake, potentialPayout, isOpen, toggleOpen,
  } = useBetSlip();

  const [betPlaced, setBetPlaced] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);

  const handlePlaceBet = async () => {
    if (selections.length === 0) return;
    
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to place bets on the blockchain.');
      return;
    }

    try {
      setIsPlacing(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request connection if not already connected
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      // Deployed contract address from our local script
      const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      const marketContract = new ethers.Contract(contractAddress, PredictionMarketArtifact.abi, signer);

      // Convert totalStake to wei
      const stakeInWei = ethers.parseEther(totalStake.toString());
      
      // Basic heuristic to pick outcome for the mock logic
      // In a real app, 'outcome' index would be stored in BetSlipContext
      let outcome = 0; // Home win
      const selectionText = selections[0].selection.toLowerCase();
      if (selectionText.includes('draw')) outcome = 2; // Draw
      else if (selectionText.includes('arsenal') || selectionText.includes('warriors')) outcome = 1; // Away win

      console.log(`Placing bet on outcome ${outcome} with ${totalStake} ETH...`);
      const tx = await marketContract.placeBet(outcome, { value: stakeInWei });
      
      console.log("Waiting for confirmation...", tx.hash);
      await tx.wait();
      
      setBetPlaced(true);
      setTimeout(() => {
        setBetPlaced(false);
        clearAll();
      }, 2500);

    } catch (error: any) {
      console.error("Transaction failed:", error);
      alert(`Transaction failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button (visible when closed) */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          className="fixed bottom-8 right-8 z-50 bg-[var(--color-accent-blue)] text-white p-4 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:bg-blue-600 transition-transform hover:scale-110 flex items-center justify-center"
        >
          <ShoppingBag size={24} />
          {selections.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-[var(--color-primary-bg)] leading-none">
              {selections.length}
            </span>
          )}
        </button>
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`bg-[var(--color-sidebar-bg)] h-full flex flex-col transition-[width,min-width,border-color] duration-300 ease-in-out overflow-hidden flex-shrink-0 ${
          isOpen ? 'w-80 min-w-80 border-l border-[var(--color-border)]' : 'w-0 min-w-0 border-l-0 border-transparent'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between flex-shrink-0 w-80">
          <div className="flex items-center space-x-2 text-white font-semibold">
            <ShoppingBag size={20} />
            <span>Bet Slip</span>
          </div>
          <div className="flex items-center gap-2">
            {selections.length > 0 && (
              <span className="bg-[var(--color-accent-blue)] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full leading-none">
                {selections.length}
              </span>
            )}
            <button
              onClick={toggleOpen}
              className="text-[var(--color-text-muted)] hover:text-white transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

      {isOpen && (
        <>
          {/* Bet placed success overlay */}
          {betPlaced ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--color-accent-green)]/20 border-2 border-[var(--color-accent-green)] flex items-center justify-center">
                <span className="text-3xl">✓</span>
              </div>
              <h3 className="text-white font-bold text-lg">Bet Placed!</h3>
              <p className="text-[var(--color-text-muted)] text-sm">
                Your bet of <span className="text-white font-semibold">${totalStake.toFixed(2)}</span> has been placed successfully.
              </p>
            </div>
          ) : selections.length === 0 ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <ShoppingBag size={36} className="text-[var(--color-border)]" />
              <p className="text-white font-semibold">Your bet slip is empty</p>
              <p className="text-[var(--color-text-muted)] text-sm">
                Click any odds button on a match to add a selection
              </p>
            </div>
          ) : (
            <>
              {/* Selections list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Clear all */}
                <div className="flex justify-end">
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                    Clear all
                  </button>
                </div>

                {selections.map(sel => (
                  <div
                    key={sel.id}
                    className="bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-xl p-3 relative"
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => removeBet(sel.id)}
                      className="absolute top-2.5 right-2.5 text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>

                    {/* Sport badge */}
                    <span className="text-[10px] font-bold text-[var(--color-accent-green)] uppercase tracking-widest">
                      {sel.sport}
                    </span>

                    {/* Match */}
                    <p className="text-[var(--color-text-muted)] text-xs mt-0.5 pr-4">{sel.matchLabel}</p>

                    {/* Market & selection */}
                    <div className="flex items-center justify-between mt-2 mb-3">
                      <div>
                        <p className="text-white font-semibold text-sm">{sel.selection}</p>
                        <p className="text-[var(--color-text-muted)] text-xs">{sel.market}</p>
                      </div>
                      <span className="text-[var(--color-accent-blue)] font-black text-lg">{sel.odds.toFixed(2)}</span>
                    </div>

                    {/* Stake input */}
                    <div className="border-t border-[var(--color-border)] pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[var(--color-text-muted)] text-xs">Stake</span>
                        <span className="text-[var(--color-accent-green)] text-xs font-semibold">
                          Win: ${(sel.stake * sel.odds).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-lg overflow-hidden mb-2">
                        <span className="text-[var(--color-text-muted)] px-2 text-sm">$</span>
                        <input
                          type="number"
                          min={1}
                          value={sel.stake}
                          onChange={e => updateStake(sel.id, Math.max(1, Number(e.target.value)))}
                          className="flex-1 bg-transparent text-white font-bold py-2 pr-3 outline-none text-sm"
                        />
                      </div>
                      {/* Quick stake buttons */}
                      <div className="grid grid-cols-4 gap-1">
                        {QUICK_STAKES.map(amt => (
                          <button
                            key={amt}
                            onClick={() => updateStake(sel.id, amt)}
                            className="bg-[var(--color-card-bg)] hover:bg-[var(--color-card-hover)] text-[var(--color-text-muted)] hover:text-white rounded py-1 text-xs font-medium transition-colors"
                          >
                            ${amt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer summary */}
              <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-primary-bg)] flex-shrink-0 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)] text-sm">Total Stake</span>
                  <span className="text-white font-bold">${totalStake.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)] text-sm">Potential Payout</span>
                  <span className="text-[var(--color-accent-green)] font-black text-lg">${potentialPayout.toFixed(2)}</span>
                </div>

                <button
                  onClick={handlePlaceBet}
                  disabled={isPlacing}
                  className={`w-full flex items-center justify-center gap-2 ${isPlacing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[var(--color-accent-green)] hover:bg-[var(--color-accent-green-hover)] active:scale-95 shadow-lg shadow-green-500/20'} text-[var(--color-sidebar-bg)] font-black py-3 rounded-xl transition-all duration-200 text-sm tracking-wide`}
                >
                  {isPlacing ? <Loader2 size={18} className="animate-spin" /> : null}
                  {isPlacing ? 'CONFIRM IN METAMASK...' : `PLACE BET · $${totalStake.toFixed(2)}`}
                </button>
              </div>
            </>
          )}
        </>
      )}
      </aside>
    </>
  );
}
