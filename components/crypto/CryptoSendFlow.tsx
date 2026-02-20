'use client';

import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { User, CryptoTransaction, CryptoAsset } from '@/lib/types';
import { formatCryptoAmount, truncateAddress, isValidAddress } from '@/lib/utils';
import { config } from '@/lib/config';
import CopyableAddress from './CopyableAddress';
import { useBranding } from '@/components/PrivyWalletWidget/BrandingContext';

type CryptoSendStep = 'select-asset' | 'enter-address' | 'enter-amount' | 'confirm' | 'success';

export default function CryptoSendFlow({
  appUser,
  balanceEth,
  balanceUsdc,
  onComplete,
}: {
  appUser: User;
  balanceEth: string;
  balanceUsdc: string;
  onComplete: () => void;
}) {
  const { wallets } = useWallets();
  const { primaryColor } = useBranding();
  const [step, setStep] = useState<CryptoSendStep>('select-asset');
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>('ETH');
  const [toAddress, setToAddress] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [resultTxn, setResultTxn] = useState<CryptoTransaction | null>(null);

  const balance = selectedAsset === 'USDC' ? balanceUsdc : balanceEth;

  const handleAddressContinue = () => {
    setError('');
    if (!isValidAddress(toAddress)) {
      setError('Enter a valid Ethereum address (0x...)');
      return;
    }
    setStep('enter-amount');
  };

  const handleAmountContinue = () => {
    setError('');
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (amount > parseFloat(balance)) {
      setError('Amount exceeds available balance');
      return;
    }
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setSending(true);
    setError('');

    let txHash: string | undefined;

    // Try real testnet send if enabled
    if (config.enableTestnetMode) {
      try {
        const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');
        if (embeddedWallet) {
          await embeddedWallet.switchChain(config.testnet.chainId);
          const provider = await embeddedWallet.getEthereumProvider();

          if (selectedAsset === 'USDC' && config.testnet.usdcAddress) {
            const { sendUsdcTransaction } = await import('@/lib/wallet');
            txHash = await sendUsdcTransaction(provider, toAddress, amountStr);
          } else if (selectedAsset === 'ETH') {
            const { sendTestnetTransactionWithAmount } = await import('@/lib/wallet');
            txHash = await sendTestnetTransactionWithAmount(provider, toAddress, amountStr);
          }
        }
      } catch {
        // Fall through to mock if testnet send fails
      }
    }

    const res = await fetch('/api/transactions?mode=crypto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: appUser.id,
        type: 'send',
        asset: selectedAsset,
        amount: amountStr,
        address: toAddress,
        txHash,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Transaction failed');
      setSending(false);
      return;
    }

    const txn: CryptoTransaction = await res.json();
    setResultTxn(txn);
    setSending(false);
    setStep('success');
  };

  if (step === 'select-asset') {
    const assets: { id: CryptoAsset; label: string; balance: string }[] = [
      { id: 'ETH', label: 'ETH', balance: balanceEth },
      { id: 'USDC', label: 'USDC', balance: balanceUsdc },
    ];

    return (
      <div>
        <p className="text-sm text-gray-500 mb-4">Which asset do you want to send?</p>
        <div className="space-y-2">
          {assets.map((a) => (
            <button
              key={a.id}
              onClick={() => { setSelectedAsset(a.id); setStep('enter-address'); }}
              className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <span className="text-sm font-medium text-gray-900">{a.label}</span>
              <span className="text-sm text-gray-400">{formatCryptoAmount(a.balance, a.id)}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'enter-address') {
    return (
      <div>
        <p className="text-sm text-gray-500 mb-4">Enter the Ethereum address to send to.</p>

        <div className="bg-gray-50 rounded-xl p-4">
          <label className="block text-sm text-gray-500 mb-2">To Address</label>
          <input
            type="text"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="0x..."
            className="w-full text-sm font-mono text-gray-900 outline-none bg-white border border-gray-200 rounded-xl px-4 py-3"
            autoFocus
          />
        </div>

        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => { setStep('select-asset'); setError(''); }}
            className="flex-1 py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleAddressContinue}
            className="flex-1 py-3 rounded-xl text-white text-sm font-medium transition-colors"
            style={{ backgroundColor: primaryColor }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === 'enter-amount') {
    return (
      <div>
        <p className="text-sm text-gray-500 mb-4">
          Sending to <CopyableAddress address={toAddress} className="text-gray-700" />
        </p>

        <div className="bg-gray-50 rounded-xl p-4">
          <label className="block text-sm text-gray-500 mb-2">Amount ({selectedAsset})</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="0.0"
              min="0"
              step={selectedAsset === 'USDC' ? '0.01' : '0.0001'}
              className="text-3xl font-bold text-gray-900 w-full outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              autoFocus
            />
            <span className="text-lg text-gray-400">{selectedAsset}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Available: {formatCryptoAmount(balance, selectedAsset)}
          </p>
        </div>

        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => { setStep('enter-address'); setError(''); }}
            className="flex-1 py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleAmountContinue}
            className="flex-1 py-3 rounded-xl text-white text-sm font-medium transition-colors"
            style={{ backgroundColor: primaryColor }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div>
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">To</span>
            <CopyableAddress address={toAddress} className="text-sm font-medium text-gray-900" />
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Amount</span>
            <span className="text-sm font-medium text-gray-900">{formatCryptoAmount(amountStr, selectedAsset)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Token</span>
            <span className="text-sm font-medium text-gray-900">{selectedAsset}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Network</span>
            <span className="text-sm font-medium text-gray-900">Base Sepolia</span>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => { setStep('enter-amount'); setError(''); }}
            className="flex-1 py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={sending}
            className="flex-1 py-3 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            {sending ? 'Sending...' : 'Confirm Send'}
          </button>
        </div>
      </div>
    );
  }

  // Success
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-1">Transaction Sent</h2>
      <p className="text-sm text-gray-500 mb-4">
        {formatCryptoAmount(amountStr, selectedAsset)} sent to <CopyableAddress address={toAddress} className="text-gray-500" />
      </p>

      {resultTxn && (
        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
          <a
            href={`${config.testnet.explorerUrl}/tx/${resultTxn.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-blue-600 break-all underline"
          >
            {resultTxn.txHash}
          </a>
        </div>
      )}

      <button
        onClick={onComplete}
        className="w-full py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Done
      </button>
    </div>
  );
}
