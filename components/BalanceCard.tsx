'use client';

import { formatCurrency } from '@/lib/utils';
import { useCompact } from '@/components/PrivyWalletWidget/BrandingContext';

export default function BalanceCard({ balanceCents }: { balanceCents: number }) {
  const compact = useCompact();

  return (
    <div className={`bg-white rounded-2xl ${compact ? 'p-4' : 'p-6'} shadow-sm border border-gray-100 text-center`}>
      <p className="text-sm text-gray-500 mb-1">Available Balance</p>
      <p className={`${compact ? 'text-2xl' : 'text-4xl'} font-bold text-gray-900 tracking-tight`}>
        {formatCurrency(balanceCents)}
      </p>
      <p className="text-xs text-gray-400 mt-1">USD</p>
    </div>
  );
}
