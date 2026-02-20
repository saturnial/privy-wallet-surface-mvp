'use client';

import { formatCryptoAmount, truncateAddress } from '@/lib/utils';

export default function CryptoBalanceCard({
  balanceEth,
  walletAddress,
}: {
  balanceEth: string;
  walletAddress: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
      <p className="text-sm text-gray-500 mb-1">Wallet Balance</p>
      <p className="text-4xl font-bold text-gray-900 tracking-tight">
        {formatCryptoAmount(balanceEth)}
      </p>
      <div className="flex items-center justify-center gap-2 mt-2">
        <span className="text-xs font-mono text-gray-400">
          {truncateAddress(walletAddress)}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
          Base Sepolia
        </span>
      </div>
    </div>
  );
}
