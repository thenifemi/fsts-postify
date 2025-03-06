import { Prisma } from '@prisma/client';
import { auth } from '@/server/auth/auth';
import { db } from '@/server/prisma/db';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const authorEmail = searchParams.get('authorEmail') ?? undefined;

    // Pagination parameters
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 50); // Cap at 50 items per page
    const skip = (page - 1) * limit;

    // Split the query into two parts: count and actual data fetch
    // This is more efficient for Prisma
    const [totalCount, posts] = await Promise.all([
      // Get total count for pagination
      db.post.count({
        where: authorEmail ? { author: { email: authorEmail } } : undefined,
      }),

      // Get paginated posts with minimized data
      db.post.findMany({
        where: authorEmail ? { author: { email: authorEmail } } : undefined,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
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
      }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        posts,
        totalCount,
        totalPages,
        currentPage: page,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const content = (formData.get('content') as string) || '';

    //TODO: Process and upload image files to storage

    const imageFiles = formData.getAll('images');
    console.log(`Received ${imageFiles.length} image files`);

    const imageUrls = Array.from(
      { length: imageFiles.length },
      (_, i) => `https://example.com/image-${Date.now()}-${i}.jpg`
    );

    try {
      const post = await db.post.create({
        data: {
          content,
          imageUrls,
          author: {
            connect: {
              id: session.user.id,
            },
          },
        },
      });

      return NextResponse.json(
        { success: true, post, message: 'Post created successfully' },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return NextResponse.json(
            { error: 'Post with this title already exists' },
            { status: 400 }
          );
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
