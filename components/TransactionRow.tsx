'use client';

import { Transaction } from '@/lib/types';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';

export default function TransactionRow({ txn }: { txn: Transaction }) {
  const isReceive = txn.type === 'receive';

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
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
