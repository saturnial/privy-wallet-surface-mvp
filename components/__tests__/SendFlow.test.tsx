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
    testnet: { chainId: 84532, chainName: 'Base Sepolia', sendAmountEth: '0.001' },
  },
}));

import SendFlow from '../SendFlow';
import type { User } from '@/lib/types';

const fakeUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
  displayName: 'Test User',
  balanceCents: 10000,
  createdAt: '2025-01-01T00:00:00Z',
};

const recipients = [
  { id: 'r1', name: 'Alice Smith', nickname: 'alice', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'r2', name: 'Bob Jones', nickname: 'bob', createdAt: '2025-01-01T00:00:00Z' },
];

function mockFetchForRecipients(fetchSpy: ReturnType<typeof vi.spyOn>) {
  fetchSpy.mockImplementation((url) => {
    if (typeof url === 'string' && url.includes('/api/recipients')) {
      return Promise.resolve(new Response(JSON.stringify(recipients), { status: 200 }));
    }
    return Promise.resolve(new Response('{}', { status: 200 }));
  });
}

describe('SendFlow', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  const onComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    mockFetchForRecipients(fetchSpy);
  });

  afterEach(() => {
    cleanup();
    fetchSpy.mockRestore();
  });

  it('renders recipient list from API', async () => {
    const { findByText } = render(<SendFlow appUser={fakeUser} onComplete={onComplete} />);
    expect(await findByText('Alice Smith')).toBeTruthy();
    expect(await findByText('Bob Jones')).toBeTruthy();
  });

  it('clicking recipient advances to amount step', async () => {
    const { findByText } = render(<SendFlow appUser={fakeUser} onComplete={onComplete} />);
    fireEvent.click(await findByText('Alice Smith'));
    expect(await findByText('Enter Amount')).toBeTruthy();
  });

  it('empty amount shows error', async () => {
    const { findByText } = render(<SendFlow appUser={fakeUser} onComplete={onComplete} />);
    fireEvent.click(await findByText('Alice Smith'));
    fireEvent.click(await findByText('Continue'));
    expect(await findByText('Enter a valid amount')).toBeTruthy();
  });

  it('amount exceeding balance shows error', async () => {
    const { findByText, getByPlaceholderText } = render(
      <SendFlow appUser={fakeUser} onComplete={onComplete} />,
    );
    fireEvent.click(await findByText('Alice Smith'));
    fireEvent.change(getByPlaceholderText('0.00'), { target: { value: '200' } });
    fireEvent.click(await findByText('Continue'));
    expect(await findByText('Amount exceeds available balance')).toBeTruthy();
  });

  it('valid amount advances to confirm step', async () => {
    const { findByText, getByPlaceholderText } = render(
      <SendFlow appUser={fakeUser} onComplete={onComplete} />,
    );
    fireEvent.click(await findByText('Alice Smith'));
    fireEvent.change(getByPlaceholderText('0.00'), { target: { value: '50' } });
    fireEvent.click(await findByText('Continue'));
    expect(await findByText('Confirm Transfer')).toBeTruthy();
  });

  it('confirm calls POST /api/transactions', async () => {
    fetchSpy.mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/api/recipients')) {
        return Promise.resolve(new Response(JSON.stringify(recipients), { status: 200 }));
      }
      return Promise.resolve(
        new Response(
          JSON.stringify({
            id: 'txn-1',
            userId: 'user-1',
            type: 'send',
            amountCents: 5000,
            counterpartyLabel: 'Alice Smith',
            createdAt: '2025-01-01T00:00:00Z',
          }),
          { status: 200 },
        ),
      );
    });

    const { findByText, getByPlaceholderText } = render(
      <SendFlow appUser={fakeUser} onComplete={onComplete} />,
    );
    fireEvent.click(await findByText('Alice Smith'));
    fireEvent.change(getByPlaceholderText('0.00'), { target: { value: '50' } });
    fireEvent.click(await findByText('Continue'));
    fireEvent.click(await findByText('Confirm Send'));

    await waitFor(() => {
      const postCall = fetchSpy.mock.calls.find(
        (c) => typeof c[1] === 'object' && c[1]?.method === 'POST',
      );
      expect(postCall).toBeTruthy();
      const body = JSON.parse(postCall![1]!.body as string);
      expect(body).toEqual(
        expect.objectContaining({
          userId: 'user-1',
          type: 'send',
          amountCents: 5000,
          counterpartyLabel: 'Alice Smith',
        }),
      );
    });
  });

  it('API error shows error message', async () => {
    fetchSpy.mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/api/recipients')) {
        return Promise.resolve(new Response(JSON.stringify(recipients), { status: 200 }));
      }
      return Promise.resolve(
        new Response(JSON.stringify({ error: 'Insufficient funds' }), { status: 400 }),
      );
    });

    const { findByText, getByPlaceholderText } = render(
      <SendFlow appUser={fakeUser} onComplete={onComplete} />,
    );
    fireEvent.click(await findByText('Alice Smith'));
    fireEvent.change(getByPlaceholderText('0.00'), { target: { value: '50' } });
    fireEvent.click(await findByText('Continue'));
    fireEvent.click(await findByText('Confirm Send'));
    expect(await findByText('Insufficient funds')).toBeTruthy();
  });

  it('API success shows success screen', async () => {
    fetchSpy.mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/api/recipients')) {
        return Promise.resolve(new Response(JSON.stringify(recipients), { status: 200 }));
      }
      return Promise.resolve(
        new Response(
          JSON.stringify({
            id: 'txn-1',
            userId: 'user-1',
            type: 'send',
            amountCents: 5000,
            counterpartyLabel: 'Alice Smith',
            createdAt: '2025-01-01T00:00:00Z',
          }),
          { status: 200 },
        ),
      );
    });

    const { findByText, getByPlaceholderText } = render(
      <SendFlow appUser={fakeUser} onComplete={onComplete} />,
    );
    fireEvent.click(await findByText('Alice Smith'));
    fireEvent.change(getByPlaceholderText('0.00'), { target: { value: '50' } });
    fireEvent.click(await findByText('Continue'));
    fireEvent.click(await findByText('Confirm Send'));
    expect(await findByText('Payment Sent')).toBeTruthy();
  });
});
