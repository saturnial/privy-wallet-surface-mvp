'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { config } from '@/lib/config';
import ModeToggle from '@/components/ModeToggle';
import Sidebar from '@/components/Sidebar';
import SettingsView from '@/components/SettingsView';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { authenticated } = usePrivy();
  const pathname = usePathname();
  const [activeView, setActiveView] = useState<'wallet' | 'settings'>('wallet');

  // On the login page, don't show sidebar
  const showSidebar = authenticated && pathname !== '/login';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="h-14 flex items-center">
          <div className={`shrink-0 px-4 ${showSidebar ? 'w-48' : ''}`}>
            <Link
              href="/"
              onClick={() => setActiveView('wallet')}
              className="text-lg font-semibold"
              style={{ color: config.primaryColor }}
            >
              Privy Wallet
            </Link>
          </div>
          <div className="flex-1 flex justify-center">
            <ModeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {showSidebar && (
          <Sidebar activeView={activeView} onViewChange={setActiveView} />
        )}
        <main className="flex-1 max-w-md mx-auto w-full px-4 py-6">
          {showSidebar && activeView === 'settings' ? (
            <SettingsView />
          ) : (
            children
          )}
        </main>
      </div>

      <footer className="border-t border-gray-100 py-4">
        <p className="text-center text-xs text-gray-400">
          {config.footerText}
        </p>
      </footer>
    </div>
  );
}
