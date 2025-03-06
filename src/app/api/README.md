# API Routes

This directory contains all the API endpoints for the Postify application, organized by feature.

## Structure

```bash
api/
├── auth/                # Authentication-related endpoints
│   └── [...nextauth]/   # NextAuth.js configuration
├── post/                # Post-related endpoints
│   ├── route.ts         # POST (create) and GET (list) posts
│   ├── [id]/            # Single post operations
│   │   ├── route.ts     # GET, PUT, DELETE single post
│   │   ├── like/        # Post like functionality
│   │   ├── dislike/     # Post dislike functionality
│   │   └── comments/    # Comments for a post
├── route_paths.ts       # Centralized route path definitions
└── README.md            # This documentation
```

## API Design Principles

1. **RESTful Design**: Following REST conventions for resource handling
2. **Consistent Error Handling**: All errors follow a consistent format
3. **Authentication**: Protected routes require valid session
4. **Data Validation**: Input validation before processing
5. **Pagination**: List endpoints support pagination

## Authentication

Most API endpoints require authentication. The auth check is performed using:

```typescript
const session = await auth();
if (!session?.user) {
  return NextResponse.json(
    { error: 'Authentication required' },
    { status: 401 }
  );
}
```

## Posts API

### List Posts

- **Endpoint**: `GET /api/post`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 50)
  - `authorEmail`: Filter by author email (optional)
- **Response**: List of posts with pagination metadata

### Create Post

- **Endpoint**: `POST /api/post`
- **Body**: FormData with:
  - `content`: Post text content
  - `images`: Image files (multiple)
- **Response**: Created post data

### Like/Unlike Post

- **Endpoint**: `POST /api/post/:id/like`
- **Response**: Updated like status

### Dislike/Undislike Post

- **Endpoint**: `POST /api/post/:id/dislike`
- **Response**: Updated dislike status

## Error Handling

All API endpoints use a consistent error response format:

```typescript
{
  error: string; // Error message
  details?: any; // Optional detailed error information
}
```

Common HTTP status codes:

- `400`: Bad Request (invalid input)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (not authorized for this resource)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

## Route Paths

The `route_paths.ts` file centralizes all API route paths for consistent usage across the application:

```typescript
export const POST_ROUTES = {
  LIST: '/api/post',
  CREATE: '/api/post',
  DETAIL: (id: string) => `/api/post/${id}`,
  LIKE: (id: string) => `/api/post/${id}/like`,
  // ...
};
```

Always use these constants instead of hardcoding paths in components.

## Database Interaction

All API routes use Prisma client for database interaction:

```typescript
import { db } from '@/server/prisma/db';

// Example query
const posts = await db.post.findMany({
  // ...
});
```
