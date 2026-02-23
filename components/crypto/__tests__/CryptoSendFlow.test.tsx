// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';

vi.mock('@privy-io/react-auth', () => ({
  useWallets: () => ({ wallets: [] }),
}));

vi.mock('@/components/PrivyWalletWidget/BrandingContext', () => ({
  useBranding: () => ({ primaryColor: '#6851FF' }),
}));

vi.mock('@/lib/config', () => ({
  config: {
    enableTestnetMode: false,
    testnet: {
      chainId: 84532,
      chainName: 'Base Sepolia',
      explorerUrl: 'https://sepolia.basescan.org',
      usdcAddress: '0xUSDC',
    },
  },
}));

vi.mock('@/components/crypto/CopyableAddress', () => ({
  default: ({ address }: { address: string }) => React.createElement('span', null, address),
}));

import CryptoSendFlow from '../CryptoSendFlow';
import type { User } from '@/lib/types';

const fakeUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
  displayName: 'Test User',
  balanceCents: 10000,
  createdAt: '2025-01-01T00:00:00Z',
};

const validAddress = '0x1234567890abcdef1234567890abcdef12345678';

describe('CryptoSendFlow', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  const onComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValue(new Response('{}', { status: 200 }));
  });

  afterEach(() => {
    cleanup();
    fetchSpy.mockRestore();
  });

  function renderFlow() {
    return render(
      <CryptoSendFlow
        appUser={fakeUser}
        balanceEth="1.0000"
        balanceUsdc="100.00"
        onComplete={onComplete}
      />,
    );
  }

  it('renders asset selection (ETH, USDC)', () => {
    const { getAllByText } = renderFlow();
    // ETH and USDC each appear as button label text
    expect(getAllByText('ETH').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('USDC').length).toBeGreaterThanOrEqual(1);
  });

  it('clicking ETH advances to address step', () => {
    const { getAllByText, getByPlaceholderText } = renderFlow();
    // Click the first ETH element (the button label)
    fireEvent.click(getAllByText('ETH')[0]);
    expect(getByPlaceholderText('0x...')).toBeTruthy();
  });

  it('invalid address shows error', () => {
    const { getAllByText, getByPlaceholderText, getByText } = renderFlow();
    fireEvent.click(getAllByText('ETH')[0]);
    fireEvent.change(getByPlaceholderText('0x...'), { target: { value: 'bad' } });
    fireEvent.click(getByText('Continue'));
    expect(getByText('Enter a valid Ethereum address (0x...)')).toBeTruthy();
  });

  it('valid address advances to amount step', () => {
    const { getAllByText, getByPlaceholderText } = renderFlow();
    fireEvent.click(getAllByText('ETH')[0]);
    fireEvent.change(getByPlaceholderText('0x...'), { target: { value: validAddress } });
    fireEvent.click(getAllByText('Continue')[0]);
    expect(getByPlaceholderText('0.0')).toBeTruthy();
  });

  it('empty amount shows error', () => {
    const { getAllByText, getByPlaceholderText, getByText } = renderFlow();
    fireEvent.click(getAllByText('ETH')[0]);
    fireEvent.change(getByPlaceholderText('0x...'), { target: { value: validAddress } });
    fireEvent.click(getByText('Continue'));
    // Now on amount step
    fireEvent.click(getByText('Continue'));
    expect(getByText('Enter a valid amount')).toBeTruthy();
  });

  it('amount exceeding balance shows error', () => {
    const { getAllByText, getByPlaceholderText, getByText } = renderFlow();
    fireEvent.click(getAllByText('ETH')[0]);
    fireEvent.change(getByPlaceholderText('0x...'), { target: { value: validAddress } });
    fireEvent.click(getByText('Continue'));
    fireEvent.change(getByPlaceholderText('0.0'), { target: { value: '999' } });
    fireEvent.click(getByText('Continue'));
    expect(getByText('Amount exceeds available balance')).toBeTruthy();
  });

  it('valid amount advances to confirm step', () => {
    const { getAllByText, getByPlaceholderText, getByText } = renderFlow();
    fireEvent.click(getAllByText('ETH')[0]);
    fireEvent.change(getByPlaceholderText('0x...'), { target: { value: validAddress } });
    fireEvent.click(getByText('Continue'));
    fireEvent.change(getByPlaceholderText('0.0'), { target: { value: '0.5' } });
    fireEvent.click(getByText('Continue'));
    expect(getByText('Confirm Send')).toBeTruthy();
  });

  it('confirm calls POST /api/transactions?mode=crypto', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'ctx-1',
          userId: 'user-1',
          type: 'send',
          asset: 'ETH',
          amount: '0.5',
          address: validAddress,
          txHash: '0xhash',
          network: 'Base Sepolia',
          createdAt: '2025-01-01T00:00:00Z',
        }),
        { status: 200 },
      ),
    );

    const { getAllByText, getByPlaceholderText, getByText } = renderFlow();
    fireEvent.click(getAllByText('ETH')[0]);
    fireEvent.change(getByPlaceholderText('0x...'), { target: { value: validAddress } });
    fireEvent.click(getByText('Continue'));
    fireEvent.change(getByPlaceholderText('0.0'), { target: { value: '0.5' } });
    fireEvent.click(getByText('Continue'));
    fireEvent.click(getByText('Confirm Send'));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/transactions?mode=crypto',
        expect.objectContaining({ method: 'POST' }),
      );
      const postCall = fetchSpy.mock.calls.find(
        (c) => typeof c[0] === 'string' && c[0].includes('/api/transactions'),
      );
      const body = JSON.parse(postCall![1]!.body as string);
      expect(body).toEqual(
        expect.objectContaining({
          userId: 'user-1',
          type: 'send',
          asset: 'ETH',
          amount: '0.5',
          address: validAddress,
        }),
      );
    });
  });

  it('API error shows error message', async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Network error' }), { status: 400 }),
    );

    const { getAllByText, getByPlaceholderText, getByText, findByText } = renderFlow();
    fireEvent.click(getAllByText('ETH')[0]);
    fireEvent.change(getByPlaceholderText('0x...'), { target: { value: validAddress } });
    fireEvent.click(getByText('Continue'));
    fireEvent.change(getByPlaceholderText('0.0'), { target: { value: '0.5' } });
    fireEvent.click(getByText('Continue'));
    fireEvent.click(getByText('Confirm Send'));
    expect(await findByText('Network error')).toBeTruthy();
  });

  it('API success shows success screen', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'ctx-1',
          userId: 'user-1',
          type: 'send',
          asset: 'ETH',
          amount: '0.5',
          address: validAddress,
          txHash: '0xhash',
          network: 'Base Sepolia',
          createdAt: '2025-01-01T00:00:00Z',
        }),
        { status: 200 },
      ),
    );

    const { getAllByText, getByPlaceholderText, getByText, findByText } = renderFlow();
    fireEvent.click(getAllByText('ETH')[0]);
    fireEvent.change(getByPlaceholderText('0x...'), { target: { value: validAddress } });
    fireEvent.click(getByText('Continue'));
    fireEvent.change(getByPlaceholderText('0.0'), { target: { value: '0.5' } });
    fireEvent.click(getByText('Continue'));
    fireEvent.click(getByText('Confirm Send'));
    expect(await findByText('Transaction Sent')).toBeTruthy();
  });
});
