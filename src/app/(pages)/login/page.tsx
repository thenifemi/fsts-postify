import { auth } from '@/server/auth/auth';
import { redirect } from 'next/navigation';
import { LoginForm } from './login-form';
import { PAGE_ROUTES } from '@/app/api/route_paths';

export default async function AuthPage({}) {
  const session = await auth();

  if (session?.user) {
    redirect(PAGE_ROUTES.POSTS);
  }

  return (
    <div className='flex items-center justify-center min-h-screen px-4'>
      <LoginForm />
    </div>
  );
}
