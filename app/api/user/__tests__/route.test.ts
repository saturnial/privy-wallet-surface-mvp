import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db/queries', () => ({
  getUser: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  resetUser: vi.fn(),
}));

import { GET, POST, DELETE } from '../route';
import { getUser, createUser, updateUser, resetUser } from '@/lib/db/queries';

const mockGetUser = getUser as ReturnType<typeof vi.fn>;
const mockCreateUser = createUser as ReturnType<typeof vi.fn>;
const mockUpdateUser = updateUser as ReturnType<typeof vi.fn>;
const mockResetUser = resetUser as ReturnType<typeof vi.fn>;

const fakeUser = {
  id: 'abc123',
  email: 'test@example.com',
  walletAddress: '0x123',
  displayName: 'Test',
  balanceCents: 10000,
  createdAt: '2025-06-01T00:00:00Z',
};

function makeGet(params: Record<string, string>) {
  const url = new URL('http://localhost/api/user');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url);
}

function makePost(body: Record<string, unknown>) {
  return new NextRequest(new URL('http://localhost/api/user'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeDelete(params: Record<string, string>) {
  const url = new URL('http://localhost/api/user');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url, { method: 'DELETE' });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/user', () => {
  it('returns 400 when email is missing', async () => {
    const res = await GET(makeGet({}));
    expect(res.status).toBe(400);
  });

  it('returns 404 when user not found', async () => {
    mockGetUser.mockResolvedValue(undefined);
    const res = await GET(makeGet({ email: 'nobody@test.com' }));
    expect(res.status).toBe(404);
  });

  it('returns 200 with user JSON when found', async () => {
    mockGetUser.mockResolvedValue(fakeUser);
    const res = await GET(makeGet({ email: 'test@example.com' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(fakeUser);
  });
});

describe('POST /api/user', () => {
  it('returns 400 when email is missing in body', async () => {
    const res = await POST(makePost({}));
    expect(res.status).toBe(400);
  });

  it('returns 200 with existing user when no displayName', async () => {
    mockGetUser.mockResolvedValue(fakeUser);
    const res = await POST(makePost({ email: 'test@example.com' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(fakeUser);
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('returns 200 and calls updateUser when displayName provided', async () => {
    const updatedUser = { ...fakeUser, displayName: 'New Name' };
    mockGetUser.mockResolvedValue(fakeUser);
    mockUpdateUser.mockResolvedValue(updatedUser);
    const res = await POST(makePost({ email: 'test@example.com', displayName: 'New Name' }));
    expect(res.status).toBe(200);
    expect(mockUpdateUser).toHaveBeenCalledWith('test@example.com', { displayName: 'New Name' });
  });

  it('returns 201 and calls createUser for new user', async () => {
    mockGetUser.mockResolvedValue(undefined);
    mockCreateUser.mockResolvedValue(fakeUser);
    const res = await POST(makePost({ email: 'new@example.com', walletAddress: '0xabc' }));
    expect(res.status).toBe(201);
    expect(mockCreateUser).toHaveBeenCalled();
  });
});

describe('DELETE /api/user', () => {
  it('returns 400 when email is missing', async () => {
    const res = await DELETE(makeDelete({}));
    expect(res.status).toBe(400);
  });

  it('returns 200 and calls resetUser', async () => {
    mockResetUser.mockResolvedValue(fakeUser);
    const res = await DELETE(makeDelete({ email: 'test@example.com' }));
    expect(res.status).toBe(200);
    expect(mockResetUser).toHaveBeenCalledWith('test@example.com');
  });
});
