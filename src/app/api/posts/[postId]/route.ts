import { Prisma } from '@prisma/client';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/server/auth/auth';
import { db } from '@/server/prisma/db';

// No longer needed since we only use IDs

export async function GET({ params }: { params: { postId: string } }) {
  try {
    const postId = params.postId;

    const post = await db.post.findUnique({
      where: { id: postId },
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
            comments: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error(`Error fetching post ${params.postId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const postId = params.postId;
    const existingPost = await db.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const content = formData.get('content') as string;
    const imageUrls =
      (formData.get('imageUrls') as string)?.split(',').filter(Boolean) || [];

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Check if user is authorized to update this post
    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this post' },
        { status: 403 }
      );
    }

    try {
      // Update the post
      const updatedPost = await db.post.update({
        where: { id: existingPost.id },
        data: {
          content,
          imageUrls,
        },
      });

      return NextResponse.json(
        { success: true, post: updatedPost },
        { status: 200 }
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw error;
      }
      throw error;
    }
  } catch (error) {
    console.error(`Error updating post:`, error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const postId = params.postId;
    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this post' },
        { status: 403 }
      );
    }

    // Delete all related data first
    await db.comment.deleteMany({ where: { postId } });
    await db.like.deleteMany({ where: { postId } });
    await db.dislike.deleteMany({ where: { postId } });

    // Delete the post
    await db.post.delete({
      where: { id: postId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting post:`, error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
