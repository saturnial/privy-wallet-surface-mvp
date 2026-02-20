'use client';

import { PrivyWalletWidget } from '@/components/PrivyWalletWidget';
import { gustoBranding } from '@/lib/branding';

const GUSTO_TEAL = '#0A8080';

const navItems = ['Payroll', 'People', 'Benefits', 'Reports', 'Wallet & Payouts'];

export default function GustoPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Gusto Top Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="h-14 flex items-center px-6">
          <span className="text-xl font-bold" style={{ color: GUSTO_TEAL }}>
            Gusto
          </span>
          <div className="ml-8 flex items-center gap-1 text-sm text-gray-500">
            <span className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 font-medium text-xs">
              Acme Corp
            </span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
              AC
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Gusto Left Nav */}
        <nav className="w-48 bg-white border-r border-gray-200 shrink-0">
          <div className="py-4">
            {navItems.map((item) => (
              <div
                key={item}
                className={`px-4 py-2 text-sm cursor-default ${
                  item === 'Wallet & Payouts'
                    ? 'font-semibold text-gray-900 border-r-2'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={
                  item === 'Wallet & Payouts'
                    ? { borderRightColor: GUSTO_TEAL, color: GUSTO_TEAL }
                    : undefined
                }
              >
                {item}
              </div>
            ))}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-8 max-w-3xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Wallet &amp; Payouts
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Gusto uses Privy to provide embedded wallet infrastructure for payroll
            and payouts. Employees can send, receive, and manage funds directly
            from within Gusto.
          </p>

          <div className="max-w-md">
            <PrivyWalletWidget branding={gustoBranding} />
          </div>

          {/* Embed configuration panel */}
          <div className="mt-8 max-w-md">
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-700">
                <span className="text-xs font-medium text-gray-400">Embed Configuration</span>
                <span className="text-[10px] font-mono text-gray-500">BrandingConfig</span>
              </div>
              <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto">
                <code>{`<PrivyWalletWidget
  branding={{
    brandName:          "${gustoBranding.brandName}"
    primaryColor:       "${gustoBranding.primaryColor}"
    surfaceStyle:       "${gustoBranding.surfaceStyle}"
    customerSupportUrl: "${gustoBranding.customerSupportUrl}"
  }}
/>`}</code>
              </pre>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
