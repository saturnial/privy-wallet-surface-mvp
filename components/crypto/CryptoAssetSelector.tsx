'use client';

import { CryptoAsset } from '@/lib/types';

export default function CryptoAssetSelector({
  selected,
  onSelect,
}: {
  selected: CryptoAsset;
  onSelect: (asset: CryptoAsset) => void;
}) {
  const assets: CryptoAsset[] = ['ETH', 'USDC'];

  return (
    <div className="flex bg-gray-100 rounded-full p-0.5 text-xs font-medium w-fit">
      {assets.map((asset) => (
        <button
          key={asset}
          onClick={() => onSelect(asset)}
          className={`px-4 py-1.5 rounded-full transition-colors ${
            selected === asset
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {asset}
        </button>
      ))}
    </div>
  );
}
