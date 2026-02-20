'use client';

import Link from 'next/link';

export default function CryptoActionButtons() {
  return (
    <div className="flex gap-3 mt-4">
      <Link
        href="/send"
        className="flex-1 bg-gray-900 text-white text-center py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        Send ETH
      </Link>
      <Link
        href="/receive"
        className="flex-1 bg-white text-gray-900 text-center py-3 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        Receive ETH
      </Link>
    </div>
  );
}
