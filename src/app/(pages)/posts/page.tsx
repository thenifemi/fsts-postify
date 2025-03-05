import { auth } from '@/server/auth/auth';
import { redirect } from 'next/navigation';

export default async function PostsPage({}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return <div>Posts</div>;
}
