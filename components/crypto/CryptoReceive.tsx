'use client';

import { QRCodeSVG } from 'qrcode.react';
import CopyableAddress from './CopyableAddress';

export default function CryptoReceive({ walletAddress }: { walletAddress: string }) {
  return (
    <div>
      <div className="flex justify-center mb-5">
        <div className="bg-white rounded-xl p-3 border border-gray-100">
          <QRCodeSVG value={walletAddress} size={180} level="M" />
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-4 flex justify-center">
        <CopyableAddress address={walletAddress} full className="text-sm text-gray-900 break-all" />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
        <p className="text-xs font-medium text-amber-800 text-center">
          Only send ETH or USDC on Base Sepolia to this address.
        </p>
        <p className="text-xs text-amber-600 text-center mt-1">
          Other tokens or networks are not supported and may result in permanent loss.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          Base Sepolia
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          ETH
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          USDC
        </span>
      </div>
    </div>
  );
}
