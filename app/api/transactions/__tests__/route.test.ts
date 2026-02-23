import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db/queries', () => ({
  getTransactions: vi.fn(),
  createTransaction: vi.fn(),
  getCryptoData: vi.fn(),
  createCryptoTransaction: vi.fn(),
}));

import { GET, POST } from '../route';
import {
  getTransactions,
  createTransaction,
  getCryptoData,
  createCryptoTransaction,
} from '@/lib/db/queries';

const mockGetTransactions = getTransactions as ReturnType<typeof vi.fn>;
const mockCreateTransaction = createTransaction as ReturnType<typeof vi.fn>;
const mockGetCryptoData = getCryptoData as ReturnType<typeof vi.fn>;
const mockCreateCryptoTransaction = createCryptoTransaction as ReturnType<typeof vi.fn>;

const fakeTxn = {
  id: 'txn1',
  userId: 'u1',
  type: 'receive',
  amountCents: 5000,
  counterpartyLabel: 'Alice',
  createdAt: '2025-06-10T10:00:00Z',
};

const fakeCryptoData = {
  balanceEth: '0.5000',
  balanceUsdc: '250.00',
  transactions: [],
};

const fakeCryptoTxn = {
  id: 'ct1',
  userId: 'u1',
  type: 'send',
  asset: 'ETH',
  amount: '0.1000',
  address: '0xabc',
  txHash: '0xdef',
  network: 'Base Sepolia',
  createdAt: '2025-06-10T10:00:00Z',
};

function makeGet(params: Record<string, string>) {
  const url = new URL('http://localhost/api/transactions');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url);
}

function makePost(body: Record<string, unknown>, params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/transactions');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/transactions', () => {
  it('returns 400 when userId is missing', async () => {
    const res = await GET(makeGet({}));
    expect(res.status).toBe(400);
  });

  it('returns 200 with fiat transactions', async () => {
    mockGetTransactions.mockResolvedValue([fakeTxn]);
    const res = await GET(makeGet({ userId: 'u1' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([fakeTxn]);
  });

  it('returns 200 with crypto data when mode=crypto', async () => {
    mockGetCryptoData.mockResolvedValue(fakeCryptoData);
    const res = await GET(makeGet({ userId: 'u1', mode: 'crypto' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(fakeCryptoData);
  });
});

describe('POST /api/transactions (fiat)', () => {
  it('returns 400 when required fields are missing', async () => {
    const res = await POST(makePost({ userId: 'u1' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when query returns error', async () => {
    mockCreateTransaction.mockResolvedValue({ error: 'Insufficient balance' });
    const res = await POST(
      makePost({ userId: 'u1', type: 'send', amountCents: 9999, counterpartyLabel: 'Bob' })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Insufficient balance' });
  });

  it('returns 201 on success', async () => {
    mockCreateTransaction.mockResolvedValue(fakeTxn);
    const res = await POST(
      makePost({ userId: 'u1', type: 'receive', amountCents: 5000, counterpartyLabel: 'Alice' })
    );
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(fakeTxn);
  });
});

describe('POST /api/transactions (crypto)', () => {
  it('returns 400 when required fields are missing', async () => {
    const res = await POST(makePost({ userId: 'u1' }, { mode: 'crypto' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when query returns error', async () => {
    mockCreateCryptoTransaction.mockResolvedValue({ error: 'Insufficient ETH balance' });
    const res = await POST(
      makePost(
        { userId: 'u1', type: 'send', amount: '10', address: '0xabc' },
        { mode: 'crypto' }
      )
    );
    expect(res.status).toBe(400);
  });

  it('returns 201 on success', async () => {
    mockCreateCryptoTransaction.mockResolvedValue(fakeCryptoTxn);
    const res = await POST(
      makePost(
        { userId: 'u1', type: 'send', asset: 'ETH', amount: '0.1', address: '0xabc' },
        { mode: 'crypto' }
      )
    );
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(fakeCryptoTxn);
  });

  it('defaults asset to ETH when not provided', async () => {
    mockCreateCryptoTransaction.mockResolvedValue(fakeCryptoTxn);
    await POST(
      makePost(
        { userId: 'u1', type: 'send', amount: '0.1', address: '0xabc' },
        { mode: 'crypto' }
      )
    );
    expect(mockCreateCryptoTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ asset: 'ETH' })
    );
  });
});
