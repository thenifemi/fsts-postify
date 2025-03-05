import { auth } from '@/server/auth/auth';
import { db } from '@/server/prisma/db';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
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
      include: { post: true },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if user is authorized to delete this comment
    // Allow if user is comment author or post author
    const isCommentAuthor = comment.authorId === userId;

    const post = await db.post.findUnique({
      where: { id: comment.postId },
    });

    const isPostAuthor = post?.authorId === userId;

    if (!isCommentAuthor && !isPostAuthor) {
      return NextResponse.json(
        { error: 'Not authorized to delete this comment' },
        { status: 403 }
      );
    }

    // Delete likes and dislikes first
    await db.like.deleteMany({
      where: { commentId },
    });

    await db.dislike.deleteMany({
      where: { commentId },
    });

    // Then delete the comment
    await db.comment.delete({
      where: { id: commentId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting comment ${params.commentId}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
