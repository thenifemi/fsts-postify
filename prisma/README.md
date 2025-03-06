# Database Layer (Prisma)

This directory contains the Prisma ORM configuration and database schema for the Postify application.

## Structure

```bash
prisma/
├── schema.prisma         # Main Prisma schema file
├── migrations/           # Database migrations
```

## Schema Overview

The Postify database uses a PostgreSQL database with the following main models:

### User

Users are the central entity in the application:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  posts         Post[]
  comments      Comment[]
  likes         Like[]
  dislikes      Dislike[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Post

Posts are created by users and can contain text and images:

```prisma
model Post {
  id        String    @id @default(cuid())
  content   String?
  imageUrls String[]
  author    User      @relation(fields: [authorId], references: [id])
  authorId  String
  comments  Comment[]
  likes     Like[]
  dislikes  Dislike[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([id])
}
```

### Social Interactions

Likes, dislikes, and comments are tracked as separate entities:

```prisma
model Like {
  id        String   @id @default(cuid())
  likedById String
  postId    String?
  commentId String?
  createdAt DateTime @default(now())

  likedBy User     @relation(fields: [likedById], references: [id])
  post    Post?    @relation(fields: [postId], references: [id])
  comment Comment? @relation(fields: [commentId], references: [id])

  @@unique([likedById, postId])
}

model Dislike {
  id           String  @id @default(cuid())
  dislikedById String
  postId       String?
  commentId    String?

  dislikedBy User     @relation(fields: [dislikedById], references: [id])
  post       Post?    @relation(fields: [postId], references: [id])
  comment    Comment? @relation(fields: [commentId], references: [id])

  @@unique([dislikedById, postId])
}
```

### Authentication

NextAuth.js models for authentication:

```prisma
model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([provider, providerAccountId])
}

model Session {
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Database Setup

### Environment Variables

Prisma requires the `DATABASE_URL` environment variable in your `.env` file:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/postify"
```

### Common Commands

The following npm scripts are available for database management:

- `pnpm db:generate`: Generate Prisma client
- `pnpm db:migrate:dev`: Create and apply migrations in development
- `pnpm db:migrate`: Apply migrations in production
- `pnpm db:push`: Push schema changes without migrations
- `pnpm db:studio`: Open Prisma Studio to manage data

### Database Client

To use the Prisma client in the application, import it from the central instance:

```typescript
import { db } from '@/server/prisma/db';

// Example usage
const posts = await db.post.findMany();
```

## Relationships

Key relationships in the database:

- User → Posts: One-to-many
- User → Comments: One-to-many
- Post → Comments: One-to-many
- User → Likes/Dislikes: One-to-many
- Post → Likes/Dislikes: One-to-many
- Comment → Likes/Dislikes: One-to-many

## Indexes and Performance

The schema includes indexes on commonly queried fields:

- `@@index([id])` on Post

## Data Validation

Data validation happens at multiple levels:

1. Prisma schema constraints (unique fields, required fields)
2. API route validation (server-side)
3. Form validation in UI components (client-side)

## Schema Evolution

When modifying the schema:

1. Update the `schema.prisma` file
2. Run `pnpm db:migrate:dev --name your_migration_name`
3. Test the changes
4. Commit both the schema and migration files
