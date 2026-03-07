import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(request) {
  const payload = verifyAdminToken(request);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, username: payload.username });
}
