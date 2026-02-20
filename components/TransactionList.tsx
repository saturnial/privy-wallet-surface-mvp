'use client';

import { Transaction } from '@/lib/types';
import TransactionRow from './TransactionRow';
import { useCompact } from '@/components/PrivyWalletWidget/BrandingContext';

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const compact = useCompact();

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No activity yet
      </div>
    );
  }

  return (
    <div className={compact ? 'mt-4' : 'mt-6'}>
      <h2 className={`text-sm font-semibold text-gray-500 uppercase tracking-wide ${compact ? 'mb-1' : 'mb-2'}`}>
        Recent Activity
      </h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 px-4">
        {transactions.map((txn) => (
          <TransactionRow key={txn.id} txn={txn} />
        ))}
      </div>
    </div>
  );
}
