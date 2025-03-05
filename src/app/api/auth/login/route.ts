import { signIn } from '@/server/auth/auth';
import { NextRequest, NextResponse } from 'next/server';
import { PAGE_ROUTES } from '../../route_paths';

export async function GET(request: NextRequest) {
  try {
    return await signIn('github', {
      redirectTo: request.nextUrl.searchParams.get('callbackUrl') || PAGE_ROUTES.POSTS,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.redirect(
      new URL(`${PAGE_ROUTES.LOGIN}?error=login_failed`, request.url)
    );
  }
}
