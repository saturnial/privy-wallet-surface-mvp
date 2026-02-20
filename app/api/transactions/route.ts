import { NextRequest, NextResponse } from 'next/server';
import { getTransactions, createTransaction } from '@/lib/mockStore';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }
  const txns = getTransactions(userId);
  return NextResponse.json(txns);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, type, amountCents, counterpartyLabel, txHash } = body;

  if (!userId || !type || !amountCents || !counterpartyLabel) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const result = createTransaction({
    userId,
    type,
    amountCents,
    counterpartyLabel,
    txHash,
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}
