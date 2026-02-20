'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';

export default function DebugPanel() {
  const { user } = usePrivy();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem('debug_panel_visible') === 'true');
  }, []);

  if (!visible) return null;

  return (
    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Debug Info
      </p>
      <div className="space-y-1 font-mono text-xs text-gray-600">
        <p>Wallet: {user?.wallet?.address || 'N/A'}</p>
        <p>Email: {user?.email?.address || 'N/A'}</p>
        <p>Privy ID: {user?.id || 'N/A'}</p>
      </div>
    </div>
  );
}
