'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import {
  CircleArrowUp,
  MessageCircle,
  CircleArrowDown,
  Share2,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { POST_ROUTES } from '@/app/api/route_paths';
import { toast } from 'sonner';
import { apiError } from '@/app/utils/error-handler';
import { cn } from '@/lib/utils';
import NumberFlow from '@number-flow/react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { PostWithRelations } from '../types';

interface PostCardProps {
  post: PostWithRelations;
}

export default function PostCard({ post }: PostCardProps) {
  const [activeImage, setActiveImage] = useState(0);
  const queryClient = useQueryClient();
  const hasImages = post.imageUrls?.length > 0;

  // Track user interactions with local state synced to props
  const [hasLiked, setHasLiked] = useState(!!post.isLiked);
  const [hasDisliked, setHasDisliked] = useState(!!post.isDisliked);

  // Update local state when post data changes (after query invalidation)
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
    toast.info('Comment feature coming soon');
  }

  function handleShare() {
    navigator.clipboard
      .writeText(`${window.location.origin}/posts/${post.id}`)
      .then(() => toast.success('Link copied to clipboard'))
      .catch(() => toast.error('Failed to copy link'));
  }

  return (
    <div className='rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md overflow-hidden'>
      <div className='p-4'>
        {/* Author info */}
        <div className='mb-3 flex items-center space-x-3'>
          <Link
            href={`/profile/${post.author.id}`}
            className='focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full'
          >
            <Avatar className='h-8 w-8'>
              <AvatarImage
                src={post.author.image || undefined}
                alt={post.author.name || 'User'}
              />
              <AvatarFallback>
                {post.author.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div>
            <Link
              href={`/profile/${post.author.id}`}
              className='hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-sm'
            >
              <p className='text-xs font-medium'>{post.author.name}</p>
            </Link>

            <p className='text-xs text-muted-foreground'>
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        {/* Post content */}
        <Link
          href={`/posts/${post.id}`}
          className='focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md block'
        >
          {post.content && <p className='mb-3 text-sm py-2'>{post.content}</p>}
        </Link>

        {/* Images */}
        {hasImages && (
          <div className='mb-3'>
            <Link
              href={`/posts/${post.id}`}
              className='focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md block'
            >
              <div className='relative aspect-video overflow-hidden rounded-md bg-muted'>
                <Image
                  src={post.imageUrls[activeImage]}
                  alt={`Post image ${activeImage + 1}`}
                  fill
                  sizes='(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 50vw, 33vw'
                  className='object-cover'
                  priority={activeImage === 0}
                  quality={80}
                />
              </div>
            </Link>

            {/* Image thumbnails if multiple images */}
            {post.imageUrls.length > 1 && (
              <div className='mt-2 flex space-x-1 overflow-x-auto scrollbar-thin'>
                {post.imageUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveImage(index);
                    }}
                    className={cn(
                      'relative h-12 w-12 flex-shrink-0 cursor-pointer overflow-hidden rounded-md border-2',
                      activeImage === index
                        ? 'border-primary'
                        : 'border-transparent'
                    )}
                    aria-label={`View image ${index + 1}`}
                  >
                    <Image
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      sizes='48px'
                      className='object-cover'
                      quality={60}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className='mt-2 flex border-t pt-3'>
          <ActionButton
            icon={
              <CircleArrowUp
                className={cn('h-4 w-4', {
                  'text-green-600': hasLiked,
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
            motionProps={{
              animate: hasLiked ? { y: [0, -5, 0] } : {},
              transition: { duration: 0.3 },
            }}
          />

          <ActionButton
            icon={
              <CircleArrowDown
                className={cn('h-4 w-4', {
                  'text-red-600': hasDisliked,
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
            motionProps={{
              animate: hasDisliked ? { y: [0, 5, 0] } : {},
              transition: { duration: 0.3 },
            }}
          />

          <ActionButton
            icon={<MessageCircle className='h-4 w-4' strokeWidth={1.5} />}
            label={
              post._count.comments > 0 ? (
                <NumberFlow value={post._count.comments} />
              ) : null
            }
            onClick={handleComment}
            motionProps={{
              whileHover: { rotate: [-5, 5, 0] },
              transition: { duration: 0.3 },
            }}
          />

          <ActionButton
            icon={<Share2 className='h-4 w-4' strokeWidth={1.5} />}
            label='Share'
            onClick={handleShare}
            motionProps={{
              whileHover: { rotate: [0, 15, -15, 0] },
              transition: { duration: 0.5 },
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  motionProps?: Record<string, any>;
}

function ActionButton({
  icon,
  label,
  onClick,
  disabled,
  motionProps,
}: ActionButtonProps) {
  return (
    <motion.div className='flex-1' whileTap={{ scale: 0.95 }}>
      <Button
        variant='ghost'
        size='sm'
        className='w-full cursor-pointer hover:bg-transparent focus:ring-2 focus:ring-primary/20'
        onClick={onClick}
        disabled={disabled}
        aria-label={typeof label === 'string' ? label : undefined}
      >
        <motion.div {...motionProps}>{icon}</motion.div>
        {label && (
          <span className='ml-1 text-xs text-muted-foreground'>{label}</span>
        )}
      </Button>
    </motion.div>
  );
}
