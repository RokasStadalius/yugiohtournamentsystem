import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isBanned = request.cookies.get('isBanned')?.value === '1';
  const path = request.nextUrl.pathname;

  if (isBanned && path !== '/banned') {
    return NextResponse.redirect(new URL('/banned', request.url));
  }

  return NextResponse.next();
}