import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db/queries', () => ({
  getTransactions: vi.fn(),
}));

import { GET } from '../route';
import { getTransactions } from '@/lib/db/queries';

const mockGetTransactions = getTransactions as ReturnType<typeof vi.fn>;

function makeGet(params: Record<string, string>) {
  const url = new URL('http://localhost/api/statements');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/statements', () => {
  it('returns 400 when userId is missing', async () => {
    const res = await GET(makeGet({}));
    expect(res.status).toBe(400);
  });

  it('returns CSV with header and data rows', async () => {
    mockGetTransactions.mockResolvedValue([
      {
        id: 'txn1',
        userId: 'u1',
        type: 'receive',
        amountCents: 10000,
        counterpartyLabel: 'Alice',
        createdAt: '2025-06-10T10:00:00Z',
        txHash: '0xabc',
      },
    ]);
    const res = await GET(makeGet({ userId: 'u1' }));
    expect(res.headers.get('Content-Type')).toBe('text/csv');
    const body = await res.text();
    const lines = body.split('\n');
    expect(lines[0]).toBe('Date,Type,Amount,Counterparty,Reference');
    expect(lines[1]).toContain('receive');
    expect(lines[1]).toContain('$100.00');
    expect(lines[1]).toContain('Alice');
    expect(lines[1]).toContain('0xabc');
  });

  it('returns CSV with header only when no transactions', async () => {
    mockGetTransactions.mockResolvedValue([]);
    const res = await GET(makeGet({ userId: 'u1' }));
    const body = await res.text();
    const lines = body.split('\n');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe('Date,Type,Amount,Counterparty,Reference');
  });
});
