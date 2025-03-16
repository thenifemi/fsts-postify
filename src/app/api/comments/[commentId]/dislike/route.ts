import { auth } from '@/server/auth/auth';
import { db } from '@/server/prisma/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  context: { params: { commentId: string } }
): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const commentId = context.params.commentId;
    const userId = session.user.id;

    // Verify comment exists
    const comment = await db.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if user already disliked the comment
    const existingDislike = await db.dislike.findFirst({
      where: {
        commentId,
        dislikedById: userId,
      },
    });

    if (existingDislike) {
      // User already disliked the comment, so undislike it
      await db.dislike.delete({
        where: { id: existingDislike.id },
      });

      return NextResponse.json(
        { disliked: false, isDisliked: false, message: 'Comment undisliked successfully' },
        { status: 200 }
      );
    } else {
      // User hasn't disliked the comment, so dislike it

      // First, remove any existing like
      const existingLike = await db.like.findFirst({
        where: {
          commentId,
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
          comment: {
            connect: {
              id: commentId,
            },
          },
        },
      });

      return NextResponse.json(
        { disliked: true, isDisliked: true, message: 'Comment disliked successfully' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error(
      `Error disliking/undisliking comment ${context.params.commentId}:`,
      error
    );
    return NextResponse.json(
      { error: 'Failed to process dislike action' },
      { status: 500 }
    );
  }
}
