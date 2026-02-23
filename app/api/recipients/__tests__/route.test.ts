import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db/queries', () => ({
  getRecipients: vi.fn(),
}));

import { GET } from '../route';
import { getRecipients } from '@/lib/db/queries';

const mockGetRecipients = getRecipients as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/recipients', () => {
  it('returns 200 with recipients array', async () => {
    const fakeRecipients = [
      { id: 'r1', name: 'Alice', nickname: 'alice', createdAt: '2025-06-01T00:00:00Z' },
    ];
    mockGetRecipients.mockResolvedValue(fakeRecipients);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(fakeRecipients);
  });

  it('returns 200 with empty array when no recipients', async () => {
    mockGetRecipients.mockResolvedValue([]);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });
});
