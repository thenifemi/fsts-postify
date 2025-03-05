import { signOut } from '@/server/auth/auth';
import { NextRequest, NextResponse } from 'next/server';
import { PAGE_ROUTES } from '../../route_paths';

export async function GET(request: NextRequest) {
  try {
    return await signOut({
      redirectTo: request.nextUrl.searchParams.get('callbackUrl') || PAGE_ROUTES.HOME,
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.redirect(new URL(`${PAGE_ROUTES.HOME}?error=logout_failed`, request.url));
  }
}
