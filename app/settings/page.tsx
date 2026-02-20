'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import DebugPanel from '@/components/DebugPanel';
import { User } from '@/lib/types';

export default function SettingsPage() {
  const { user: privyUser, logout } = usePrivy();
  const router = useRouter();
  const [appUser, setAppUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [debugVisible, setDebugVisible] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!privyUser?.email?.address) return;
    const res = await fetch(`/api/user?email=${encodeURIComponent(privyUser.email.address)}`);
    if (res.ok) {
      const user: User = await res.json();
      setAppUser(user);
      setDisplayName(user.displayName);
    }
  }, [privyUser]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    setDebugVisible(localStorage.getItem('debug_panel_visible') === 'true');
  }, []);

  const handleSave = async () => {
    if (!privyUser?.email?.address) return;
    setSaving(true);
    setSaved(false);

    await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: privyUser.email.address,
        displayName,
      }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToggleDebug = () => {
    const next = !debugVisible;
    setDebugVisible(next);
    localStorage.setItem('debug_panel_visible', String(next));
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <AuthGuard>
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-6">Settings</h1>

        {/* Display Name */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-3 px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          {saved && (
            <span className="ml-3 text-sm text-green-600">Saved</span>
          )}
        </div>

        {/* Debug Panel Toggle */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Debug Panel</p>
              <p className="text-xs text-gray-400">Show wallet address and technical details</p>
            </div>
            <button
              onClick={handleToggleDebug}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                debugVisible ? 'bg-green-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  debugVisible ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>

        <DebugPanel />

        {appUser && (
          <p className="text-xs text-gray-400 text-center mt-6">
            Account created {new Date(appUser.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </AuthGuard>
  );
}
