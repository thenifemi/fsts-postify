'use client';

import { useSession } from '@/app/context/session-provider';
import { Loader2 } from 'lucide-react';
import { POST_ROUTES } from '@/app/api/route_paths';
import { useQuery } from '@tanstack/react-query';
import EmptyPosts from './components/EmptyPosts';
import { toast } from 'sonner';
import CreateEditPost from './components/CreateEditPost';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function PostsPage(props: Record<string, never>) {
  const { status } = useSession();

  const { data, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await fetch(POST_ROUTES.LIST);

      if (!response.ok) {
        console.error('Failed to fetch posts', response);
        toast.error('Failed to fetch posts');
      }

      return response.json();
    },
  });

  const posts = data?.posts || [];

  if (status === 'loading' || isLoading) {
    return (
      <div className='p-4 flex justify-center items-center min-h-screen/2'>
        <Loader2 className='w-8 h-8 animate-spin' strokeWidth={0.5} />
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className='p-4 space-y-8 max-w-lg mx-auto'>
        <div className='flex flex-row items-center justify-between'>
          <h1 className='text-base font-semibold text-muted-foreground'>
            Posts
          </h1>

          <CreateEditPost />
        </div>

        {posts.length === 0 ? (
          <EmptyPosts />
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {posts.map((post: any) => (
              <div key={post.id}>{post.title}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
