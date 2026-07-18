import React from 'react';
import TopNav from './TopNav';
import SportsLobby from '../sidebar/SportsLobby';
import BetSlip from '../sidebar/BetSlip';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <SportsLobby />
        <main className="flex-1 overflow-y-auto bg-[var(--color-primary-bg)]">
          {children}
        </main>
        <BetSlip />
      </div>
    </div>
  );
}
