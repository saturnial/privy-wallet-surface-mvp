'use client';

import { Transaction } from '@/lib/types';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { useCompact } from '@/components/PrivyWalletWidget/BrandingContext';

export default function TransactionRow({ txn }: { txn: Transaction }) {
  const compact = useCompact();
  const isReceive = txn.type === 'receive';

  return (
    <div className={`flex items-center justify-between ${compact ? 'py-2' : 'py-3'}`}>
      <div className="flex items-center gap-3">
        <div
          className={`${compact ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'} rounded-full flex items-center justify-center ${
            isReceive
              ? 'bg-green-50 text-green-600'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {isReceive ? '+' : '-'}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {txn.counterpartyLabel}
          </p>
          <p className="text-xs text-gray-400">
            {formatDate(txn.createdAt)} at {formatTime(txn.createdAt)}
          </p>
        </div>
      </div>
      <p
        className={`text-sm font-semibold ${
          isReceive ? 'text-green-600' : 'text-gray-900'
        }`}
      >
        {isReceive ? '+' : '-'}{formatCurrency(txn.amountCents)}
      </p>
    </div>
  );
}
