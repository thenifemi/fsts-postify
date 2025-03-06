'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { POST_ROUTES, COMMENT_ROUTES } from '@/app/api/route_paths';
import { PostWithRelations, Comment } from '../types';
import {
  Loader2,
  MessageCircle,
  Share2,
  CircleArrowUp,
  CircleArrowDown,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import NumberFlow from '@number-flow/react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { Card, CardContent, CardFooter } from '@/app/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { useState } from 'react';
import { useSession } from '@/app/context/session-provider';
import CommentItem from '../components/CommentItem';
import ActionButton from '../components/ActionButton';

interface PostResponse {
  post: PostWithRelations;
  comments: Comment[];
}

export default function PostPage() {
  const { postId } = useParams();
  const router = useRouter();
  const { session } = useSession();
  const [commentText, setCommentText] = useState('');
  const queryClient = useQueryClient();

  // Fetch post data
  const { data, isLoading, error, refetch } = useQuery<PostResponse>({
    queryKey: ['post', postId],
    queryFn: async () => {
      const response = await fetch(POST_ROUTES.DETAIL(postId as string));
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
  });

  // Mutations
  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(POST_ROUTES.LIKE(postId as string), {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to like post');
      }
      return response.json();
    },
    onSuccess: () => refetch(),
    onError: (error: Error) => {
      toast.error(`Failed to like post: ${error.message}`);
    },
  });

  const dislikeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(POST_ROUTES.DISLIKE(postId as string), {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to dislike post');
      }
      return response.json();
    },
    onSuccess: () => refetch(),
    onError: (error: Error) => {
      toast.error(`Failed to dislike post: ${error.message}`);
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const formData = new FormData();
      formData.append('content', content);

      const response = await fetch(COMMENT_ROUTES.LIST(postId as string), {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      return response.json();
    },
    onSuccess: () => {
      refetch();
      setCommentText('');
      toast.success('Comment added successfully');
      // Also invalidate post queries to update comment counts
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add comment: ${error.message}`);
    },
  });

  function handleLike() {
    likeMutation.mutate();
  }

  function handleDislike() {
    dislikeMutation.mutate();
  }

  function handleShare() {
    navigator.clipboard
      .writeText(`${window.location.origin}/posts/${postId}`)
      .then(() => toast.success('Link copied to clipboard'))
      .catch(() => toast.error('Failed to copy link'));
  }

  function handleSubmitComment() {
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  }

  // Loading state
  if (isLoading) {
    return (
      <div className='p-4 flex justify-center items-center min-h-[40vh]'>
        <Loader2 className='w-8 h-8 animate-spin' strokeWidth={0.5} />
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className='p-4 text-center text-red-500'>
        Failed to load post. Please try again.
      </div>
    );
  }

  const { post, comments } = data;
  const hasImages = post.imageUrls && post.imageUrls.length > 0;

  return (
    <div className='p-4 space-y-8 max-w-lg mx-auto mt-20'>
      <Button
        variant='outline'
        size='sm'
        className='gap-1'
        onClick={() => router.push('/posts')}
      >
        <ChevronLeft className='h-4 w-4' />
        <span className='text-xs'>Back to Posts</span>
      </Button>

      {/* Main post */}
      <Card className='rounded-xl shadow-md overflow-hidden border-neutral-200 dark:border-neutral-800'>
        <CardContent className='space-y-6'>
          {/* Author info */}
          <div className='flex items-center gap-4'>
            <Avatar className='h-10 w-10 ring-2 ring-background'>
              <AvatarImage
                src={post.author.image || undefined}
                alt={post.author.name || 'User'}
              />
              <AvatarFallback className='bg-primary/10 text-primary'>
                {post.author.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className='space-y-1'>
              <p className='text-sm font-semibold'>{post.author.name}</p>
              <p className='text-xs text-muted-foreground'>
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          {/* Post content */}
          {post.content && (
            <p className='text-sm leading-relaxed text-neutral-800 dark:text-neutral-200'>
              {post.content}
            </p>
          )}

          {/* Images */}
          {hasImages && (
            <div className='space-y-3'>
              <div className='relative aspect-[16/9] overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900'>
                <Image
                  src={post.imageUrls[0]}
                  alt={`Post image`}
                  fill
                  sizes='(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 50vw, 33vw'
                  className='object-cover'
                  priority
                  quality={85}
                />
              </div>
              {post.imageUrls.length > 1 && (
                <div className='grid grid-cols-2 gap-2'>
                  {post.imageUrls.slice(1).map((url, index) => (
                    <div
                      key={index}
                      className='relative aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900'
                    >
                      <Image
                        src={url}
                        alt={`Additional post image ${index + 2}`}
                        fill
                        sizes='(max-width: 640px) 50vw, (max-width: 768px) 40vw, (max-width: 1024px) 25vw, 16vw'
                        className='object-cover'
                        quality={80}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className='flex justify-between'>
          <div className='flex w-full gap-4 mr-auto'>
            <ActionButton
              icon={
                <CircleArrowUp
                  className={cn('h-4 w-4', {
                    'text-green-600 dark:text-green-500': post.isLiked,
                  })}
                  strokeWidth={1}
                />
              }
              label={
                post._count.likes > 0 ? (
                  <NumberFlow value={post._count.likes} />
                ) : null
              }
              onClick={handleLike}
              disabled={likeMutation.isPending}
            />

            <ActionButton
              icon={
                <CircleArrowDown
                  className={cn('h-4 w-4', {
                    'text-red-600 dark:text-red-500': post.isDisliked,
                  })}
                  strokeWidth={1}
                />
              }
              label={
                post._count.dislikes > 0 ? (
                  <NumberFlow value={post._count.dislikes} />
                ) : null
              }
              onClick={handleDislike}
              disabled={dislikeMutation.isPending}
            />

            <ActionButton
              icon={<MessageCircle className='h-4 w-4' strokeWidth={1} />}
              label={
                post._count.comments > 0 ? (
                  <NumberFlow value={post._count.comments} />
                ) : null
              }
              onClick={() => {}}
            />
          </div>

          <ActionButton
            variant='outline'
            icon={<Share2 className='h-4 w-4' strokeWidth={1} />}
            label='Share'
            onClick={handleShare}
          />
        </CardFooter>
      </Card>

      {/* Comments section */}
      <div className='mt-6 pt-6 border-t space-y-4'>
        <div className='flex justify-between items-center'>
          <h2 className='text-sm text-muted-foreground'>
            Comments ({comments.length})
          </h2>
        </div>

        {/* Comment form */}
        {session?.user && (
          <div className='flex gap-3 mb-6'>
            <Avatar className='h-8 w-8 flex-shrink-0'>
              <AvatarImage
                src={session.user.image || undefined}
                alt={session.user.name || 'User'}
              />
              <AvatarFallback className='bg-primary/10 text-primary'>
                {session.user.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 space-y-2'>
              <Textarea
                placeholder='Add a comment...'
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className='resize-none min-h-[80px]'
              />
              <div className='flex justify-end'>
                <Button
                  size='sm'
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || commentMutation.isPending}
                >
                  {commentMutation.isPending ? (
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  ) : null}
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Comments list */}
        {comments.length === 0 ? (
          <p className='text-sm text-muted-foreground text-center py-6'>
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className='space-y-4'>
            {comments.map((comment: Comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId as string}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
