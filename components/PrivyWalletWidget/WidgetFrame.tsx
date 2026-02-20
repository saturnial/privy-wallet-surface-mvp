'use client';

import { useBranding, useCompact } from './BrandingContext';
import ModeToggle from '@/components/ModeToggle';

export default function WidgetFrame({ children }: { children: React.ReactNode }) {
  const { brandName, primaryColor, customerSupportUrl } = useBranding();
  const compact = useCompact();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span
          className="text-sm font-semibold"
          style={{ color: primaryColor }}
        >
          {brandName} Wallet
        </span>
        <ModeToggle />
      </div>

      {/* Body */}
      <div className={compact ? 'px-4 py-3' : 'px-6 py-5'}>
        {children}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-between">
        <span className="text-[11px] text-gray-400">Powered by Privy</span>
        {customerSupportUrl && (
          <a
            href={customerSupportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            Need help?
          </a>
        )}
      </div>
    </div>
  );
}
