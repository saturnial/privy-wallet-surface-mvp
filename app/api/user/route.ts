import { NextRequest, NextResponse } from 'next/server';
import { getUser, createUser, updateUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }
  const user = await getUser(email);
  if (!user) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, walletAddress, displayName } = body;

  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }

  const existing = await getUser(email);
  if (existing) {
    if (displayName) {
      const updated = await updateUser(email, { displayName });
      return NextResponse.json(updated);
    }
    return NextResponse.json(existing);
  }

  const user = await createUser({ email, walletAddress: walletAddress || '', displayName });
  return NextResponse.json(user, { status: 201 });
}
