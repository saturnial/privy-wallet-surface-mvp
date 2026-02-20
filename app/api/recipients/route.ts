import { NextResponse } from 'next/server';
import { getRecipients } from '@/lib/mockStore';

export async function GET() {
  return NextResponse.json(getRecipients());
}
