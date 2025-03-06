import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/server/auth/auth';
import { db } from '@/server/prisma/db';

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
    const userId = session.user.id;

    // Verify post exists
    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user already liked the post
    const existingLike = await db.like.findFirst({
      where: {
        postId,
        likedById: userId,
      },
    });

    if (existingLike) {
      // User already liked the post, so unlike it
      await db.like.delete({
        where: { id: existingLike.id },
      });

      return NextResponse.json(
        { liked: false, message: 'Post unliked successfully' },
        { status: 200 }
      );
    } else {
      // User hasn't liked the post, so like it

      // First, remove any existing dislike
      const existingDislike = await db.dislike.findFirst({
        where: {
          postId,
          dislikedById: userId,
        },
      });

      if (existingDislike) {
        await db.dislike.delete({
          where: { id: existingDislike.id },
        });
      }

      // Then create the like
      await db.like.create({
        data: {
          likedBy: {
            connect: {
              id: userId,
            },
          },
          post: {
            connect: {
              id: postId,
            },
          },
        },
      });

      return NextResponse.json(
        { liked: true, message: 'Post liked successfully' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error(`Error liking/unliking post ${params.postId}:`, error);
    return NextResponse.json(
      { error: 'Failed to process like action' },
      { status: 500 }
    );
  }
}
