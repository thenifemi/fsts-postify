import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/server/auth/auth';
import { db } from '@/server/prisma/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const postId = params.postId;

    // Verify post exists
    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Fetch comments for the post
    const comments = await db.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            dislikes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If user is authenticated, check which comments they've liked/disliked
    if (userId) {
      const userLikes = await db.like.findMany({
        where: {
          likedById: userId,
          commentId: { in: comments.map(comment => comment.id) },
        },
        select: {
          commentId: true,
        },
      });

      const userDislikes = await db.dislike.findMany({
        where: {
          dislikedById: userId,
          commentId: { in: comments.map(comment => comment.id) },
        },
        select: {
          commentId: true,
        },
      });

      // Create lookup sets for faster checking
      const likedCommentIds = new Set(userLikes.map(like => like.commentId));
      const dislikedCommentIds = new Set(userDislikes.map(dislike => dislike.commentId));

      // Add isLiked and isDisliked flags to each comment
      comments.forEach(comment => {
        comment.isLiked = likedCommentIds.has(comment.id);
        comment.isDisliked = dislikedCommentIds.has(comment.id);
      });
    }

    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error(`Error fetching comments for post ${params.postId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const postId = params.postId;

    // Verify post exists
    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const content = formData.get('content') as string;
    const imageUrls =
      (formData.get('imageUrls') as string)?.split(',').filter(Boolean) || [];

    if (!content) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Create the comment
    const comment = await db.comment.create({
      data: {
        content,
        imageUrls,
        author: {
          connect: {
            id: session.user.id,
          },
        },
        post: {
          connect: {
            id: postId,
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true, 
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            dislikes: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    console.error(`Error creating comment for post ${params.postId}:`, error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
