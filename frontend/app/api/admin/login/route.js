import { NextResponse } from 'next/server';
import { verifyCredentials, createToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    if (!verifyCredentials(username.trim(), password)) {
      // Uniform delay to prevent timing-based username enumeration
      await new Promise((r) => setTimeout(r, 300));
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const token = createToken(username.trim());

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
