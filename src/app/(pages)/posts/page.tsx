'use client';

import { useSession } from '@/app/context/session-provider';
import { Loader2 } from 'lucide-react';
import { POST_ROUTES } from '@/app/api/route_paths';
import { useQuery } from '@tanstack/react-query';
import EmptyPosts from './components/EmptyPosts';
import { toast } from 'sonner';
import CreateEditPost from './components/CreateEditPost';
import PostCard from './components/PostCard';
import { PostWithRelations, PostsApiResponse } from './types';

/**
 * Main posts page component
 * Displays all posts with authentication checks
 */
export default function PostsPage() {
  const { status } = useSession();

  // Fetch posts using React Query
  const { data, isLoading, error } = useQuery<PostsApiResponse>({
    queryKey: ['posts'],
    queryFn: async () => {
      try {
        const response = await fetch(POST_ROUTES.LIST);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return response.json();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Failed to fetch posts:', errorMessage);
        toast.error('Failed to fetch posts');
        throw err;
      }
    },
  });

  const posts = data?.posts || [];

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className='p-4 flex justify-center items-center min-h-[40vh]'>
        <Loader2 className='w-8 h-8 animate-spin' strokeWidth={0.5} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='p-4 text-center text-red-500'>
        Failed to load posts. Please try again.
      </div>
    );
  }

  // Authenticated state with content
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
          <div className='flex flex-col gap-4'>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Unauthenticated state
  return null;
}
