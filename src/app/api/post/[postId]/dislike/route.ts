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

    // Check if user already disliked the post
    const existingDislike = await db.dislike.findFirst({
      where: {
        postId,
        dislikedById: userId,
      },
    });

    if (existingDislike) {
      // User already disliked the post, so undislike it
      await db.dislike.delete({
        where: { id: existingDislike.id },
      });

      return NextResponse.json(
        { disliked: false, message: 'Post undisliked successfully' },
        { status: 200 }
      );
    } else {
      // User hasn't disliked the post, so dislike it

      // First, remove any existing like
      const existingLike = await db.like.findFirst({
        where: {
          postId,
          likedById: userId,
        },
      });

      if (existingLike) {
        await db.like.delete({
          where: { id: existingLike.id },
        });
      }

      // Then create the dislike
      await db.dislike.create({
        data: {
          dislikedBy: {
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
        { disliked: true, message: 'Post disliked successfully' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error(`Error disliking/undisliking post ${params.postId}:`, error);
    return NextResponse.json(
      { error: 'Failed to process dislike action' },
      { status: 500 }
    );
  }
}
