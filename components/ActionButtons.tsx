'use client';

import { useCompact } from '@/components/PrivyWalletWidget/BrandingContext';

export default function ActionButtons({
  onSend,
  onReceive,
}: {
  onSend: () => void;
  onReceive: () => void;
}) {
  const compact = useCompact();

  return (
    <div className={`flex ${compact ? 'gap-2 mt-3' : 'gap-3 mt-4'}`}>
      <button
        onClick={onSend}
        className={`flex-1 bg-gray-900 text-white text-center ${compact ? 'py-2' : 'py-3'} rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors`}
      >
        Send
      </button>
      <button
        onClick={onReceive}
        className={`flex-1 bg-white text-gray-900 text-center ${compact ? 'py-2' : 'py-3'} rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors`}
      >
        Receive
      </button>
    </div>
  );
}
