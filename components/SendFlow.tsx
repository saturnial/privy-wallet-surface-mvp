'use client';

import { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { Recipient, User, Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { config } from '@/lib/config';

type SendStep = 'select-recipient' | 'enter-amount' | 'confirm' | 'success';

export default function SendFlow({
  appUser,
  onComplete,
}: {
  appUser: User;
  onComplete: () => void;
}) {
  const { wallets } = useWallets();
  const [step, setStep] = useState<SendStep>('select-recipient');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [amountStr, setAmountStr] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [resultTxn, setResultTxn] = useState<Transaction | null>(null);
  const [testnetSending, setTestnetSending] = useState(false);
  const [testnetHash, setTestnetHash] = useState<string | null>(null);
  const [testnetError, setTestnetError] = useState('');

  useEffect(() => {
    fetch('/api/recipients')
      .then((res) => res.json())
      .then(setRecipients);
  }, []);

  const amountCents = Math.round(parseFloat(amountStr || '0') * 100);

  const handleSelectRecipient = (r: Recipient) => {
    setSelectedRecipient(r);
    setStep('enter-amount');
    setError('');
  };

  const handleAmountContinue = () => {
    setError('');
    if (!amountStr || amountCents <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (amountCents > appUser.balanceCents) {
      setError('Amount exceeds available balance');
      return;
    }
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!selectedRecipient) return;
    setSending(true);
    setError('');

    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: appUser.id,
        type: 'send',
        amountCents,
        counterpartyLabel: selectedRecipient.name,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Transaction failed');
      setSending(false);
      return;
    }

    const txn: Transaction = await res.json();
    setResultTxn(txn);
    setSending(false);
    setStep('success');
  };

  if (step === 'select-recipient') {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Select Recipient</h2>
        <p className="text-sm text-gray-500 mb-4">Choose who to send funds to.</p>
        <div className="space-y-2">
          {recipients.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelectRecipient(r)}
              className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900">{r.name}</p>
              <p className="text-xs text-gray-400">@{r.nickname}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'enter-amount') {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Enter Amount</h2>
        <p className="text-sm text-gray-500 mb-4">
          Sending to <span className="font-medium text-gray-700">{selectedRecipient?.name}</span>
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <label className="block text-sm text-gray-500 mb-2">Amount (USD)</label>
          <div className="flex items-center gap-2">
            <span className="text-2xl text-gray-400">$</span>
            <input
              type="number"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="text-3xl font-bold text-gray-900 w-full outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              autoFocus
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Available: {formatCurrency(appUser.balanceCents)}
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-500 mt-3">{error}</p>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => { setStep('select-recipient'); setError(''); }}
            className="flex-1 py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleAmountContinue}
            className="flex-1 py-3 rounded-xl text-white text-sm font-medium transition-colors"
            style={{ backgroundColor: config.primaryColor }}
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirm Transfer</h2>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Recipient</span>
            <span className="text-sm font-medium text-gray-900">{selectedRecipient?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Amount</span>
            <span className="text-sm font-medium text-gray-900">{formatCurrency(amountCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Currency</span>
            <span className="text-sm font-medium text-gray-900">USD</span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 mt-3">{error}</p>
        )}

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
            style={{ backgroundColor: config.primaryColor }}
          >
            {sending ? 'Sending...' : 'Confirm Send'}
          </button>
        </div>
      </div>
    );
  }

  const handleTestnetSend = async () => {
    setTestnetSending(true);
    setTestnetError('');
    try {
      const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');
      if (!embeddedWallet) {
        setTestnetError('No embedded wallet found');
        setTestnetSending(false);
        return;
      }

      await embeddedWallet.switchChain(config.testnet.chainId);
      const provider = await embeddedWallet.getEthereumProvider();
      const { sendTestnetTransaction } = await import('@/lib/wallet');
      // Send to a burn address for demo purposes
      const hash = await sendTestnetTransaction(
        provider,
        '0x000000000000000000000000000000000000dEaD'
      );
      setTestnetHash(hash);
    } catch (err: unknown) {
      setTestnetError(err instanceof Error ? err.message : 'Testnet transaction failed');
    }
    setTestnetSending(false);
  };

  // Success
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-1">Payment Sent</h2>
      <p className="text-sm text-gray-500 mb-4">
        {formatCurrency(amountCents)} sent to {selectedRecipient?.name}
      </p>

      {resultTxn?.txHash && (
        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
          <p className="text-xs font-mono text-gray-700 break-all">{resultTxn.txHash}</p>
        </div>
      )}

      {config.enableTestnetMode && !testnetHash && (
        <div className="mb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
            <p className="text-xs font-medium text-amber-700">Testnet Mode</p>
            <p className="text-xs text-amber-600">
              Send {config.testnet.sendAmountEth} ETH on {config.testnet.chainName}
            </p>
          </div>
          <button
            onClick={handleTestnetSend}
            disabled={testnetSending}
            className="w-full py-3 rounded-xl text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {testnetSending ? 'Sending Onchain...' : 'Send Onchain (Testnet)'}
          </button>
          {testnetError && (
            <p className="text-sm text-red-500 mt-2">{testnetError}</p>
          )}
        </div>
      )}

      {testnetHash && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
          <p className="text-xs font-medium text-green-700 mb-1">Testnet Transaction Confirmed</p>
          <a
            href={`${config.testnet.explorerUrl}/tx/${testnetHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-green-600 break-all underline"
          >
            {testnetHash}
          </a>
        </div>
      )}

      <button
        onClick={onComplete}
        className="w-full py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
