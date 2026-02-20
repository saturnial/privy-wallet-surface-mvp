'use client';

import { formatCurrency } from '@/lib/utils';

export default function BalanceCard({ balanceCents }: { balanceCents: number }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
      <p className="text-sm text-gray-500 mb-1">Available Balance</p>
      <p className="text-4xl font-bold text-gray-900 tracking-tight">
        {formatCurrency(balanceCents)}
      </p>
      <p className="text-xs text-gray-400 mt-1">USD</p>
    </div>
  );
}
