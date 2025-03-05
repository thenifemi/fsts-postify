import { auth } from '@/server/auth/auth';
import { db } from '@/server/prisma/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const commentId = params.commentId;
    const userId = session.user.id;

    // Verify comment exists
    const comment = await db.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if user already liked the comment
    const existingLike = await db.like.findFirst({
      where: {
        commentId,
        likedById: userId,
      },
    });

    if (existingLike) {
      // User already liked the comment, so unlike it
      await db.like.delete({
        where: { id: existingLike.id },
      });

      return NextResponse.json(
        { liked: false, message: 'Comment unliked successfully' },
        { status: 200 }
      );
    } else {
      // User hasn't liked the comment, so like it

      // First, remove any existing dislike
      const existingDislike = await db.dislike.findFirst({
        where: {
          commentId,
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
          comment: {
            connect: {
              id: commentId,
            },
          },
        },
      });

      return NextResponse.json(
        { liked: true, message: 'Comment liked successfully' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error(`Error liking/unliking comment ${params.commentId}:`, error);
    return NextResponse.json(
      { error: 'Failed to process like action' },
      { status: 500 }
    );
  }
}
