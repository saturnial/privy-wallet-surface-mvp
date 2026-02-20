'use client';

import { useState } from 'react';
import { truncateAddress } from '@/lib/utils';

export default function CopyableAddress({
  address,
  full = false,
  className = '',
}: {
  address: string;
  full?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <span className={`inline-flex items-center gap-1 font-mono ${className}`}>
      <span>{full ? address : truncateAddress(address)}</span>
      <button
        onClick={handleCopy}
        className="inline-flex items-center justify-center w-5 h-5 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
        aria-label="Copy address"
        title={copied ? 'Copied!' : 'Copy'}
      >
        {copied ? (
          <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth={2} />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth={2} />
          </svg>
        )}
      </button>
    </span>
  );
}
