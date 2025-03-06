'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CircleArrowUp, CircleArrowDown } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { cn } from '@/lib/utils';
import NumberFlow from '@number-flow/react';
import { apiError } from '@/app/utils/error-handler';
import ActionButton from './ActionButton';
import { Comment } from '../types';
interface CommentItemProps {
  comment: Comment;
  postId: string;
}

export default function CommentItem({ comment, postId }: CommentItemProps) {
  const [hasLiked, setHasLiked] = useState(comment.isLiked || false);
  const [hasDisliked, setHasDisliked] = useState(comment.isDisliked || false);
  const queryClient = useQueryClient();

  const invalidateCommentQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['comments', postId] });
  };

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/comments/${comment.id}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to like comment');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setHasLiked(data.liked);
      setHasDisliked(false);
      invalidateCommentQueries();
    },
    onError: (error: Error) => {
      apiError(`Failed to like comment: ${error.message}`);
    },
  });

  const dislikeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/comments/${comment.id}/dislike`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to dislike comment');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setHasDisliked(data.disliked);
      setHasLiked(false);
      invalidateCommentQueries();
    },
    onError: (error: Error) => {
      apiError(`Failed to dislike comment: ${error.message}`);
    },
  });

  function handleLike() {
    likeMutation.mutate();
  }

  function handleDislike() {
    dislikeMutation.mutate();
  }

  return (
    <div className='p-3 rounded-lg border border-neutral-200 dark:border-neutral-800'>
      <div className='flex gap-3'>
        {/* Avatar */}
        <Avatar className='h-7 w-7 flex-shrink-0'>
          <AvatarImage
            src={comment.author.image || undefined}
            alt={comment.author.name || 'User'}
          />
          <AvatarFallback>
            {comment.author.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className='flex-1 space-y-1'>
          {/* Author info and comment timestamp */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='text-xs font-medium'>
                {comment.author.name || 'Anonymous'}
              </span>
              <span className='text-[10px] text-muted-foreground'>
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>

          {/* Comment content */}
          <p className='text-sm'>{comment.content}</p>

          {/* Action buttons */}
          <div className='flex gap-2 pt-1'>
            <ActionButton
              size='sm'
              icon={
                <CircleArrowUp
                  className={cn('h-3.5 w-3.5', {
                    'text-green-600 dark:text-green-500': hasLiked,
                  })}
                  strokeWidth={1.5}
                />
              }
              label={
                comment._count.likes > 0 ? (
                  <NumberFlow value={comment._count.likes} />
                ) : null
              }
              onClick={handleLike}
              disabled={likeMutation.isPending}
            />

            <ActionButton
              size='sm'
              icon={
                <CircleArrowDown
                  className={cn('h-3.5 w-3.5', {
                    'text-red-600 dark:text-red-500': hasDisliked,
                  })}
                  strokeWidth={1.5}
                />
              }
              label={
                comment._count.dislikes > 0 ? (
                  <NumberFlow value={comment._count.dislikes} />
                ) : null
              }
              onClick={handleDislike}
              disabled={dislikeMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
