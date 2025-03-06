'use client';

import { useState, useEffect, MouseEvent } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import {
  CircleArrowUp,
  MessageCircle,
  CircleArrowDown,
  Share2,
} from 'lucide-react';
import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { POST_ROUTES } from '@/app/api/route_paths';
import { toast } from 'sonner';
import { apiError } from '@/app/utils/error-handler';
import { cn } from '@/lib/utils';
import NumberFlow from '@number-flow/react';

import { PostWithRelations } from '../types';
import { Card, CardContent, CardFooter } from '@/app/components/ui/card';
import ActionButton from './ActionButton';

interface PostCardProps {
  post: PostWithRelations;
}

export default function PostCard({ post }: PostCardProps) {
  const [activeImage, setActiveImage] = useState(0);
  const queryClient = useQueryClient();
  const hasImages = post.imageUrls?.length > 0;

  const [hasLiked, setHasLiked] = useState(!!post.isLiked);
  const [hasDisliked, setHasDisliked] = useState(!!post.isDisliked);

  useEffect(() => {
    setHasLiked(!!post.isLiked);
    setHasDisliked(!!post.isDisliked);
  }, [post.isLiked, post.isDisliked]);

  const invalidatePostQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    queryClient.invalidateQueries({ queryKey: ['post', post.id] });
  };

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(POST_ROUTES.LIKE(post.id), {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

      return response.json();
    },
    onSuccess: invalidatePostQueries,
    onError: (error: Error) => {
      apiError(`Failed to like post: ${error.message}`);
    },
  });

  const dislikeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(POST_ROUTES.DISLIKE(post.id), {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to dislike post');
      }

      return response.json();
    },
    onSuccess: invalidatePostQueries,
    onError: (error: Error) => {
      apiError(`Failed to dislike post: ${error.message}`);
    },
  });

  function handleLike() {
    likeMutation.mutate();
  }

  function handleDislike() {
    dislikeMutation.mutate();
  }

  function handleComment() {
    window.location.href = `/posts/${post.id}`;
  }

  function handleShare() {
    navigator.clipboard
      .writeText(`${window.location.origin}/posts/${post.id}`)
      .then(() => toast.success('Link copied to clipboard'))
      .catch(() => toast.error('Failed to copy link'));
  }

  return (
    <Card className='rounded-xl shadow-md hover:shadow-lg overflow-hidden group border-neutral-200 dark:border-neutral-800'>
      <Link href={`/posts/${post.id}`}>
        <CardContent className='space-y-6'>
          {/* Author info */}
          <div className='flex items-center gap-4'>
            <div
              className='focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full hover:opacity-90'
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                window.location.href = `/profile/${post.author.id}`;
              }}
            >
              <Avatar className='h-8 w-8 ring-2 ring-background'>
                <AvatarImage
                  src={post.author.image || undefined}
                  alt={post.author.name || 'User'}
                />
                <AvatarFallback className='bg-primary/10 text-primary'>
                  {post.author.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className='space-y-1'>
              <div
                className='hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-sm inline-block cursor-pointer'
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  window.location.href = `/profile/${post.author.id}`;
                }}
              >
                <p className='text-xs font-semibold'>{post.author.name}</p>
              </div>

              <p className='text-[10px] text-muted-foreground'>
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
                  src={post.imageUrls[activeImage]}
                  alt={`Post image ${activeImage + 1}`}
                  fill
                  sizes='(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 50vw, 33vw'
                  className='object-cover'
                  priority={activeImage === 0}
                  quality={85}
                />
              </div>

              {/* Image thumbnails if multiple images */}
              {post.imageUrls.length > 1 && (
                <div className='flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700'>
                  {post.imageUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={(e: MouseEvent) => {
                        e.preventDefault();
                        setActiveImage(index);
                      }}
                      className={cn(
                        'relative h-14 w-14 flex-shrink-0 cursor-pointer overflow-hidden rounded-md border-2 hover:opacity-90',
                        activeImage === index
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-neutral-200 dark:border-neutral-800'
                      )}
                      aria-label={`View image ${index + 1}`}
                    >
                      <Image
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        sizes='56px'
                        className='object-cover'
                        quality={70}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Link>

      {/* Action buttons */}
      <CardFooter className='flex justify-between gap-2'>
        <ActionButton
          icon={
            <CircleArrowUp
              className={cn('h-4 w-4', {
                'text-green-600 dark:text-green-500': hasLiked,
              })}
              strokeWidth={1.5}
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
                'text-red-600 dark:text-red-500': hasDisliked,
              })}
              strokeWidth={1.5}
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
          icon={<MessageCircle className='h-4 w-4' strokeWidth={1.5} />}
          label={
            post._count.comments > 0 ? (
              <NumberFlow value={post._count.comments} />
            ) : null
          }
          onClick={handleComment}
        />

        <ActionButton
          variant='outline'
          icon={<Share2 className='h-4 w-4' strokeWidth={1.5} />}
          label='Share'
          onClick={handleShare}
        />
      </CardFooter>
    </Card>
  );
}
