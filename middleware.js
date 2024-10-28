import { NextResponse } from 'next/server';

export function middleware(request) {
  // Only run on admin API routes
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    // Skip auth check for the auth endpoint itself
    if (request.nextUrl.pathname === '/api/admin/auth') {
      return NextResponse.next();
    }

    // Check for admin auth cookie
    const adminAuth = request.cookies.get('admin_auth');
    if (adminAuth?.value !== 'true') {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/admin/:path*',
};
