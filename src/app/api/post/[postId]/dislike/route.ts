import { auth } from '@/server/auth/auth';
import { db } from '@/server/prisma/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
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
    const postId = params.postId;

    // Check if the post exists
    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if the user has already disliked this post
    const existingDislike = await db.dislike.findUnique({
      where: {
        dislikedById_postId: {
          dislikedById: userId || '',
          postId,
        },
      },
    });

    // If already disliked, remove the dislike (toggle behavior)
    if (existingDislike) {
      await db.dislike.delete({
        where: {
          id: existingDislike.id,
        },
      });

      return NextResponse.json(
        { message: 'Dislike removed', isDisliked: false },
        { status: 200 }
      );
    }

    // Remove any like if it exists (can't like and dislike simultaneously)
    await db.like.deleteMany({
      where: {
        likedById: userId,
        postId,
      },
    });

    // Create a new dislike
    await db.dislike.create({
      data: {
        dislikedBy: {
          connect: { id: userId },
        },
        post: {
          connect: { id: postId },
        },
      },
    });

    return NextResponse.json(
      { message: 'Post disliked successfully', isDisliked: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to dislike post:', error);
    return NextResponse.json(
      { error: 'Failed to dislike post' },
      { status: 500 }
    );
  }
}
