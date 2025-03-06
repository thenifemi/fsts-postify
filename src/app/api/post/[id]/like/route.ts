import { auth } from '@/server/auth/auth';
import { db } from '@/server/prisma/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const postId = params.id;

    // Check if the post exists
    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if the user has already liked this post
    const existingLike = await db.like.findUnique({
      where: {
        likedById_postId: {
          likedById: userId || '',
          postId,
        },
      },
    });

    // If already liked, remove the like (toggle behavior)
    if (existingLike) {
      await db.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      return NextResponse.json(
        { message: 'Like removed', isLiked: false },
        { status: 200 }
      );
    }

    // Remove any dislike if it exists (can't like and dislike simultaneously)
    await db.dislike.deleteMany({
      where: {
        dislikedById: userId,
        postId,
      },
    });

    // Create a new like
    await db.like.create({
      data: {
        likedBy: {
          connect: { id: userId },
        },
        post: {
          connect: { id: postId },
        },
      },
    });

    return NextResponse.json(
      { message: 'Post liked successfully', isLiked: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to like post:', error);
    return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
  }
}
