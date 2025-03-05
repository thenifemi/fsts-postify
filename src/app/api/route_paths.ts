/**
 * Centralized API route paths for the application.
 * Use these constants instead of hardcoding routes in components.
 */

// Authentication routes
export const AUTH_ROUTES = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
} as const;

// Post routes
export const POST_ROUTES = {
  LIST: '/api/post',
  CREATE: '/api/post/create',
  DETAIL: (id: string) => `/api/post/${id}`,
  UPDATE: (id: string) => `/api/post/${id}/update`,
  DELETE: (id: string) => `/api/post/${id}/delete`,
} as const;

// Page routes (not API routes, but included for convenience)
export const PAGE_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  POSTS: '/posts',
  POST_DETAIL: (id: string) => `/posts/${id}`,
} as const;
