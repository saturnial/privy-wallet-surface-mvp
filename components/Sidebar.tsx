'use client';

import { usePrivy } from '@privy-io/react-auth';

type SidebarView = 'wallet' | 'settings';

export default function Sidebar({
  activeView,
  onViewChange,
}: {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
}) {
  const { authenticated } = usePrivy();

  if (!authenticated) return null;

  const items: { id: SidebarView; label: string }[] = [
    { id: 'wallet', label: 'Wallet' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <aside className="w-48 shrink-0 border-r border-gray-200 bg-white">
      <nav className="p-3 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === item.id
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
