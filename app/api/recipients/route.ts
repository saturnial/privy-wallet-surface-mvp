import { NextResponse } from 'next/server';
import { getRecipients } from '@/lib/db/queries';

export async function GET() {
  const recipients = await getRecipients();
  return NextResponse.json(recipients);
}
