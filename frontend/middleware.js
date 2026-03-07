import { NextResponse } from 'next/server';
import { getLimiterForPath } from './lib/ratelimit';

// ─── Security headers applied to every response ──────────────────────────────
// (CSP and HSTS are also set in next.config.mjs for static pages)
const SECURITY_HEADERS = {
  'X-Content-Type-Options':    'nosniff',
  'X-Frame-Options':           'SAMEORIGIN',
  'X-XSS-Protection':          '1; mode=block',
  'Referrer-Policy':           'strict-origin-when-cross-origin',
  'Permissions-Policy':        'camera=(), microphone=(), geolocation=(), payment=()',
};

// ─── Trusted origins for CSRF checks ─────────────────────────────────────────
// Add your production domain via NEXT_PUBLIC_SITE_URL in .env.local / Vercel env vars.
const TRUSTED_ORIGINS = new Set(
  [
    'http://localhost:3000',
    process.env.NEXT_PUBLIC_SITE_URL, // e.g. https://raparin-youth.vercel.app
  ].filter(Boolean)
);

// Extract client IP (works on Vercel + local)
function getClientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const method       = request.method;

  // 1. ── CSRF protection for state-changing API calls ────────────────────────
  //    POST/PUT/DELETE requests to our API must come from our own origin.
  //    This guards against cross-site form submissions.
  if (
    pathname.startsWith('/api/') &&
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)
  ) {
    const origin  = request.headers.get('origin')  || '';
    const referer = request.headers.get('referer') || '';

    const originOk  = !origin  || TRUSTED_ORIGINS.has(origin);
    const refererOk = !referer || [...TRUSTED_ORIGINS].some(o => referer.startsWith(o));

    // On Vercel, also allow requests without an origin (server-to-server)
    const isServer = !origin && !referer;

    if (!originOk && !refererOk && !isServer) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  // 2. ── Rate limiting ────────────────────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const limiter = getLimiterForPath(pathname);

    if (limiter) {
      const ip = getClientIp(request);
      try {
        const { success, limit, remaining, reset } = await limiter.limit(ip);

        if (!success) {
          const retryAfter = Math.ceil((reset - Date.now()) / 1000);
          return new NextResponse(
            JSON.stringify({ error: 'Too many requests. Please try again later.' }),
            {
              status: 429,
              headers: {
                'Content-Type':      'application/json',
                'Retry-After':       String(retryAfter),
                'X-RateLimit-Limit': String(limit),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': String(reset),
              },
            }
          );
        }

        // Pass remaining quota to the route handler via a header
        const resp = NextResponse.next();
        resp.headers.set('X-RateLimit-Limit',     String(limit));
        resp.headers.set('X-RateLimit-Remaining', String(remaining));
        applySecurityHeaders(resp);
        return resp;
      } catch {
        // Redis unavailable — fail open (don't block the user, just log)
        console.warn('[middleware] Rate limiter unavailable, skipping');
      }
    }
  }

  // 3. ── Admin route protection ───────────────────────────────────────────────
  //    Redirect to login if the admin-token cookie is missing or empty.
  //    This is the middleware layer; API routes also check the token independently.
  if (pathname.startsWith('/admin/')) {
    // Allow the login page itself through
    const isLoginPage = pathname === '/admin' || pathname === '/admin/';
    if (!isLoginPage) {
      const token = request.cookies.get('admin-token')?.value;
      if (!token) {
        const loginUrl = new URL('/admin', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // 4. ── Apply security headers to the response ───────────────────────────────
  const response = NextResponse.next();
  applySecurityHeaders(response);
  return response;
}

function applySecurityHeaders(response) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
}

// ─── Matcher ──────────────────────────────────────────────────────────────────
// Run on all routes EXCEPT Next.js internals and static files.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png|uploads|public).*)',
  ],
};
