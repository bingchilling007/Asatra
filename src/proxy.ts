import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

// Simple in-memory rate limiter
const rateLimit = new Map<string, { count: number; lastReset: number }>();
const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute

export default auth((req) => {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const now = Date.now();

  const record = rateLimit.get(ip) ?? { count: 0, lastReset: now };

  if (now - record.lastReset > WINDOW_SIZE) {
    record.count = 0;
    record.lastReset = now;
  }

  record.count++;
  rateLimit.set(ip, record);

  if (record.count > MAX_REQUESTS) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
});

export const config = {
  // Run middleware on these routes
  matcher: [
    '/dashboard/:path*',
    '/host/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    // We might want to run on API routes too?
     '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
