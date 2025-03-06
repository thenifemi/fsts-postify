# Posts Module

The Posts module handles post creation, display, and interactions (likes, dislikes, comments) in the Postify application.

## Structure

```bash
posts/
├── components/            # Post-related components
│   ├── CreateEditPost.tsx # Post creation/editing form
│   ├── EmptyPosts.tsx     # Empty state display
│   └── PostCard.tsx       # Individual post display
├── types.ts               # TypeScript interfaces for posts
└── page.tsx               # Main posts listing page
```

## Components

### PostCard

The PostCard component displays a single post with the following features:

- Author information
- Post content
- Image gallery with carousel for multiple images
- Like/dislike interactions
- Comment section (coming soon)
- Share functionality

```tsx
<PostCard post={post} />
```

### CreateEditPost

This component provides a modal dialog for creating or editing posts:

- Rich text content
- Multiple image upload
- Form validation
- Success notifications

```tsx
<CreateEditPost editPost={existingPost} /> // For editing
<CreateEditPost /> // For creating new posts
```

## Data Flow

1. The posts page fetches posts using React Query
2. Each post is displayed using the PostCard component
3. User interactions (like, dislike) trigger API calls and update the UI
4. Post creation/editing updates the posts list via query invalidation

## API Integration

The posts module integrates with the following API endpoints:

- `GET /api/post` - Fetch posts list
- `POST /api/post` - Create new posts
- `POST /api/post/:id/like` - Like/unlike posts
- `POST /api/post/:id/dislike` - Dislike/undislike posts

## Types

The main types used in this module are:

```typescript
interface PostWithRelations {
  id: string;
  content?: string | null;
  imageUrls: string[];
  authorId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  author: Author;
  isLiked?: boolean;
  isDisliked?: boolean;
  _count: {
    likes: number;
    dislikes: number;
    comments: number;
  };
}
```

## State Management

The posts module uses React Query for server state management:

- Query keys: `['posts']` for the main posts list
- Mutations for likes/dislikes with optimistic updates
- Client-side state for UI interactions using React's useState and useEffect

## Styling

All components use Tailwind CSS with the application's design system:

- Color scheme follows the app's theme (dark/light mode support)
- Responsive design for all screen sizes
- Consistent spacing and typography
