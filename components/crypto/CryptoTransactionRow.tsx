'use client';

import { CryptoTransaction } from '@/lib/types';
import { formatCryptoAmount, truncateAddress, formatDate, formatTime } from '@/lib/utils';
import { config } from '@/lib/config';
import CopyableAddress from './CopyableAddress';
import { useCompact } from '@/components/PrivyWalletWidget/BrandingContext';

export default function CryptoTransactionRow({ txn }: { txn: CryptoTransaction }) {
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
          <div className="flex items-center gap-1.5">
            <CopyableAddress address={txn.address} className="text-sm font-medium text-gray-900" />
            <span className="text-[10px] font-medium text-gray-400">
              {txn.asset}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-gray-400">
              {formatDate(txn.createdAt)} at {formatTime(txn.createdAt)}
            </p>
            <a
              href={`${config.testnet.explorerUrl}/tx/${txn.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono text-blue-500 hover:text-blue-700"
            >
              {truncateAddress(txn.txHash)}
            </a>
          </div>
        </div>
      </div>
      <p
        className={`text-sm font-semibold ${
          isReceive ? 'text-green-600' : 'text-gray-900'
        }`}
      >
        {isReceive ? '+' : '-'}{formatCryptoAmount(txn.amount, txn.asset)}
      </p>
    </div>
  );
}
