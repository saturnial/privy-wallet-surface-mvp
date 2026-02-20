'use client';

import { CryptoTransaction } from '@/lib/types';
import CryptoTransactionRow from './CryptoTransactionRow';

export default function CryptoTransactionList({
  transactions,
}: {
  transactions: CryptoTransaction[];
}) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No onchain activity yet
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Onchain Activity
      </h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 px-4">
        {transactions.map((txn) => (
          <CryptoTransactionRow key={txn.id} txn={txn} />
        ))}
      </div>
    </div>
  );
}
