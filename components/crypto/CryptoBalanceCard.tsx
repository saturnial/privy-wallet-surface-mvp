'use client';

import { useState } from 'react';
import { formatCryptoAmount, formatCurrency } from '@/lib/utils';
import CopyableAddress from './CopyableAddress';
import { config } from '@/lib/config';

export default function CryptoBalanceCard({
  balanceEth,
  balanceUsdc,
  walletAddress,
}: {
  balanceEth: string;
  balanceUsdc: string;
  walletAddress: string;
}) {
  const [showTokens, setShowTokens] = useState(false);

  const ethUsd = parseFloat(balanceEth) * config.mockEthPriceUsd;
  const usdcUsd = parseFloat(balanceUsdc);
  const totalUsd = ethUsd + usdcUsd;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <CopyableAddress address={walletAddress} className="text-xs text-gray-400" />
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
            Base Sepolia
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-1">Total Balance</p>
        <p className="text-4xl font-bold text-gray-900 tracking-tight">
          {formatCurrency(Math.round(totalUsd * 100))}
        </p>
      </div>

      <button
        onClick={() => setShowTokens(!showTokens)}
        className="w-full mt-4 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1"
      >
        {showTokens ? 'Hide' : 'View'} tokens
        <svg
          className={`w-3 h-3 transition-transform ${showTokens ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showTokens && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">ETH</span>
              <span className="text-xs text-gray-400">{formatCryptoAmount(balanceEth, 'ETH')}</span>
            </div>
            <span className="text-sm text-gray-600">
              {formatCurrency(Math.round(ethUsd * 100))}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">USDC</span>
              <span className="text-xs text-gray-400">{formatCryptoAmount(balanceUsdc, 'USDC')}</span>
            </div>
            <span className="text-sm text-gray-600">
              {formatCurrency(Math.round(usdcUsd * 100))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
