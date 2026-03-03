import { NextRequest, NextResponse } from 'next/server';

const rateMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 120;

export function middleware(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const now = Date.now();
  const current = rateMap.get(ip);

  if (!current || current.resetAt < now) {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    current.count += 1;
    if (current.count > MAX_REQUESTS) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
    rateMap.set(ip, current);
  }

  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', req.nextUrl.pathname.startsWith('/watch/') ? 'SAMEORIGIN' : 'DENY');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
