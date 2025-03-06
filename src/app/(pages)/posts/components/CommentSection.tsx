'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { COMMENT_ROUTES } from '@/app/api/route_paths';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/app/context/session-provider';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import CommentItem from './CommentItem';
import { apiError } from '@/app/utils/error-handler';
import { Comment } from '../types';

interface CommentSectionProps {
  postId: string;
}

interface CommentType extends Comment {
  id: string;
  content: string;
  imageUrls: string[];
  authorId: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  _count: {
    likes: number;
    dislikes: number;
  };
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { status } = useSession();
  const [commentText, setCommentText] = useState('');
  const queryClient = useQueryClient();

  const isAuthenticated = status === 'authenticated';

  // Fetch comments for the post
  const {
    data: comments,
    isLoading,
    error,
  } = useQuery<CommentType[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      try {
        const response = await fetch(COMMENT_ROUTES.LIST(postId));

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return response.json();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        console.error('Failed to fetch comments:', errorMessage);
        throw err;
      }
    },
    // Don't fetch if not authenticated
    enabled: !!postId,
  });

  // Submit comment mutation
  const submitComment = useMutation({
    mutationFn: async (commentText: string) => {
      const formData = new FormData();
      formData.append('content', commentText);

      const response = await fetch(COMMENT_ROUTES.LIST(postId), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }

      return response.json();
    },
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      toast.success('Comment added successfully');
    },
    onError: (error: Error) => {
      apiError(`Failed to submit comment: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    submitComment.mutate(commentText);
  };

  if (isLoading) {
    return (
      <div className='flex justify-center p-4'>
        <Loader2 className='h-6 w-6 animate-spin' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center text-red-500 p-4'>
        Failed to load comments. Please try again.
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <h3 className='text-sm font-medium'>
        Comments ({comments?.length || 0})
      </h3>

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className='space-y-2'>
          <Textarea
            placeholder='Add a comment...'
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className='resize-none'
          />
          <div className='flex justify-end'>
            <Button
              type='submit'
              size='sm'
              disabled={submitComment.isPending || !commentText.trim()}
            >
              {submitComment.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Posting
                </>
              ) : (
                'Post Comment'
              )}
            </Button>
          </div>
        </form>
      )}

      <div className='space-y-3'>
        {comments?.length ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
          ))
        ) : (
          <p className='text-center text-sm text-muted-foreground py-4'>
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}
