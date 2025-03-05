import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get('token')?.value;

  // Check if the request is for a protected route
  if (!token && request.nextUrl.pathname !== '/login') {
    // If no token is found, redirect to login
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/(protected)/:path*',
    '/api/:path*',
  ],
}; 