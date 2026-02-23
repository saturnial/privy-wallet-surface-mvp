import { NextRequest, NextResponse } from 'next/server';
import { getTransactions } from '@/lib/db/queries';
import { formatCurrency } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const txns = await getTransactions(userId);

  const csvRows = [
    'Date,Type,Amount,Counterparty,Reference',
    ...txns.map(
      (t) =>
        `${t.createdAt},${t.type},${formatCurrency(t.amountCents)},${t.counterpartyLabel},${t.txHash || ''}`
    ),
  ];

  return new NextResponse(csvRows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="statements.csv"',
    },
  });
}
