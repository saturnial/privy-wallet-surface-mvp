'use client';

import { useInterfaceMode } from '@/lib/mode';

export default function ModeToggle() {
  const { mode, setMode, isForced } = useInterfaceMode();

  if (isForced) return null;

  return (
    <div className="flex bg-gray-100 rounded-full p-0.5 text-xs font-medium">
      <button
        onClick={() => setMode('abstracted')}
        className={`px-3 py-1 rounded-full transition-colors ${
          mode === 'abstracted'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Abstracted
      </button>
      <button
        onClick={() => setMode('crypto')}
        className={`px-3 py-1 rounded-full transition-colors ${
          mode === 'crypto'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Crypto
      </button>
    </div>
  );
}
