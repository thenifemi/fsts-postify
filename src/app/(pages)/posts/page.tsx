import { auth } from '@/server/auth/auth';
import { redirect } from 'next/navigation';

export default async function PostsPage({}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className='p-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Posts</h1>
      </div>
    </div>
  );
}
