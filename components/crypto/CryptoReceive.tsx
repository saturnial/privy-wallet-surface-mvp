'use client';

import { useState } from 'react';
import { CryptoAsset } from '@/lib/types';

export default function CryptoReceive({
  walletAddress,
  selectedAsset,
}: {
  walletAddress: string;
  selectedAsset: CryptoAsset;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Share this address to receive {selectedAsset} on Base Sepolia.
      </p>

      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <p className="text-sm font-mono text-gray-900 break-all text-center">
          {walletAddress}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          Base Sepolia
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          {selectedAsset}
        </span>
      </div>

      <button
        onClick={handleCopy}
        className="w-full py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {copied ? 'Copied!' : 'Copy Address'}
      </button>
    </div>
  );
}
