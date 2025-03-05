import { signIn } from '@/server/auth/auth';
import { NextRequest, NextResponse } from 'next/server';
import { PAGE_ROUTES } from '../../route_paths';

export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'development') {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    const redirectTo =
      request.nextUrl.searchParams.get('callbackUrl') || PAGE_ROUTES.POSTS;

    return signIn('github', { redirectTo });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.redirect(
      new URL(`${PAGE_ROUTES.LOGIN}?error=login_failed`, request.url)
    );
  }
}
