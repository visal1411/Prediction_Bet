import React from 'react';
import TopNav from './TopNav';
import SportsLobby from '../sidebar/SportsLobby';
import BetSlip from '../sidebar/BetSlip';
import { useBetSlip } from '../../context/BetSlipContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { error, clearError, info, clearInfo } = useBetSlip();

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <SportsLobby />
        <main className="flex-1 overflow-y-auto bg-[var(--color-primary-bg)]">
          {children}
        </main>
        <BetSlip />
      </div>

      {error && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 animate-pop-bounce">
          <div className="bg-[#1f0f0f]/95 backdrop-blur-md text-red-300 px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 border border-red-900/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-sm">{error}</span>
            <button onClick={clearError} className="ml-4 hover:text-red-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {info && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 animate-pop-bounce">
          <div className="bg-[#0f172a]/95 backdrop-blur-md text-blue-300 px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 border border-blue-900/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-accent-blue)]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-sm">{info}</span>
            <button onClick={clearInfo} className="ml-4 hover:text-blue-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
