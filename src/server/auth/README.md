# Authentication System

This directory contains the authentication setup for the Postify application using NextAuth.js.

## Structure

```bash
auth/
├── auth.ts          # Main NextAuth.js configuration
├── actions.ts       # Server actions for auth operations
└── README.md        # This documentation
```

## NextAuth Setup

The authentication system is built on NextAuth.js v5 with the following features:

- Github OAuth login
- Session management with HTTP-only cookies
- Prisma adapter for database integration
- Type-safe authentication

## Configuration

The `auth.ts` file contains the core configuration:

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [GitHub],
});
```

## Server Actions

Auth-related server actions are defined in `actions.ts`:

```typescript
export async function getSession(): Promise<Session | null> {
  return auth();
}
```

## Usage in API Routes

Secure API routes by adding authentication checks:

```typescript
import { auth } from '@/server/auth/auth';

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  // Handle authenticated request
}
```

## Usage in Components

Use the `useSession` hook to access session data in components:

```tsx
import { useSession } from '@/app/context/session-provider';

export function ProfileButton() {
  const { session, status } = useSession();

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'authenticated') {
    return <Avatar user={session.user} />;
  }

  return <LoginButton />;
}
```

## Session Provider

The application uses a custom SessionProvider that:

1. Centralizes session fetching logic
2. Provides session status to components
3. Handles protected route redirects
4. Offers a refetch mechanism for updating session data

The provider is implemented in `@/app/context/session-provider.tsx`.

## Protected Routes

The SessionProvider automatically handles route protection:

- Protected routes (like `/posts`) redirect unauthenticated users to login
- Guest-only routes (like `/login`) redirect authenticated users to home
- Public routes are accessible to all users

## Session Types

Session and user types are defined for type safety:

```typescript
interface SessionUser {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
}

declare module 'next-auth' {
  interface Session {
    user: SessionUser;
  }
}
```
