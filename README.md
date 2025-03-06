# Postify

Postify is a modern social media platform for sharing posts, photos, and engaging with other users. Built with Next.js, TypeScript, and Prisma, it provides a seamless experience for content creation and interaction.

![Postify logo|100x100](/public/postify.png){width=100 height=100}

## Table of Contents

- [Postify](#postify)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Authentication](#authentication)
  - [API Documentation](#api-documentation)
    - [Posts API](#posts-api)
  - [Contributing](#contributing)
  - [License](#license)

## Features

- **Authentication**: Secure user authentication with NextAuth
- **Post Creation**: Create posts with text content and multiple images
- **Social Interactions**: Like, dislike, and comment on posts
- **Responsive Design**: Mobile-first UI that works on all devices
- **Dark/Light Mode**: Built-in theme switching
- **Real-time Updates**: Post interactions update in real-time

## Tech Stack

- **Frontend**:

  - [Next.js 15](https://nextjs.org/) - React framework with App Router
  - [React 19](https://react.dev/) - UI library
  - [TypeScript](https://www.typescriptlang.org/) - Type safety
  - [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
  - [shadcn/ui](https://ui.shadcn.com/) - UI component system
  - [React Query](https://tanstack.com/query/latest) - Data fetching and caching
  - [Sonner](https://sonner.emilkowal.ski/) - Toast notifications

- **Backend**:

  - [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) - Backend API
  - [Prisma](https://www.prisma.io/) - ORM for database access
  - [NextAuth.js](https://next-auth.js.org/) - Authentication
  - [PostgreSQL](https://www.postgresql.org/) - Database

- **DevOps & Tools**:
  - [pnpm](https://pnpm.io/) - Package manager
  - [ESLint](https://eslint.org/) - Code linting
  - [Prisma Studio](https://www.prisma.io/studio) - Database management UI

## Project Structure

```bash
/
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Prisma schema definition
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (pages)/      # Route groups for pages
│   │   │   ├── login/    # Authentication pages
│   │   │   └── posts/    # Posts feature
│   │   ├── api/          # API routes
│   │   │   ├── auth/     # Auth API routes
│   │   │   └── post/     # Post API endpoints
│   │   ├── components/   # Shared UI components
│   │   └── context/      # React context providers
│   ├── lib/              # Utility functions and shared code
│   └── server/           # Server-side code
│       ├── auth/         # Authentication setup
│       └── prisma/       # Prisma client instance
└── tailwind.config.js    # Tailwind CSS configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+ (recommended) or npm/yarn
- PostgreSQL database

### Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:nifemi-fetchly/fsts-postify.git
   cd postify
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   # Create a .env file with the following variables
   DATABASE_URL="postgresql://username:password@localhost:5432/postify"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   ```

4. Run the development server:

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

Postify uses Prisma with PostgreSQL. Here's how to set up and manage your database:

1. Generate Prisma client:

   ```bash
   pnpm db:generate
   ```

2. Create and apply migrations:

   ```bash
   pnpm db:migrate:dev
   ```

3. Seed the database (if needed):

   ```bash
   pnpm db:seed
   ```

4. Open Prisma Studio to manage your data:

   ```bash
   pnpm db:studio
   ```

## Authentication

Postify uses NextAuth.js for authentication:

- **Session Management**: Server-side sessions with secure HTTP-only cookies
- **User Authentication**: Github OAuth login
- **Protected Routes**: Middleware to secure pages and API routes

## API Documentation

### Posts API

- `GET /api/post` - Get paginated list of posts
- `POST /api/post` - Create a new post
- `GET /api/post/:id` - Get a specific post
- `POST /api/post/:id/like` - Like/unlike a post
- `POST /api/post/:id/dislike` - Dislike/undislike a post
- `GET /api/post/:id/comments` - Get comments for a post
- `POST /api/post/:id/comments/create` - Add a comment to a post

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request and tag @nifemi-fetchly for review

## License

This project is licensed under the MIT License - see the LICENSE file for details.
