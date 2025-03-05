import { redirect } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { auth } from '../server/auth/auth';

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth');
  }

  redirect('/posts');

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <LoaderCircle className='w-6 h-6 animate-spin' strokeWidth={0.5} />
    </div>
  );
}
