import { signOut } from '@/server/auth/auth';
import { NextRequest, NextResponse } from 'next/server';
import { PAGE_ROUTES } from '../../route_paths';

export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'development') {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    const redirectTo =
      request.nextUrl.searchParams.get('callbackUrl') || PAGE_ROUTES.HOME;

    return signOut({ redirectTo });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.redirect(
      new URL(`${PAGE_ROUTES.HOME}?error=logout_failed`, request.url)
    );
  }
}
