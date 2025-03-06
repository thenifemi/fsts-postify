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
  CREATE: '/api/post',
  DETAIL: (id: string) => `/api/post/${id}`,
  UPDATE: (id: string) => `/api/post/${id}`,
  DELETE: (id: string) => `/api/post/${id}`,
} as const;

// Comment routes
export const COMMENT_ROUTES = {
  LIST: (postId: string) => `/api/post/${postId}/comments`,
  CREATE: (postId: string) => `/api/post/${postId}/comments/create`,
  DETAIL: (postId: string, commentId: string) =>
    `/api/post/${postId}/comments/${commentId}`,
  UPDATE: (postId: string, commentId: string) =>
    `/api/post/${postId}/comments/${commentId}/update`,
  DELETE: (postId: string, commentId: string) =>
    `/api/post/${postId}/comments/${commentId}/delete`,
} as const;

// Page routes (not API routes, but included for convenience)
export const PAGE_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  POSTS: '/posts',
  POST_DETAIL: (id: string) => `/posts/${id}`,
} as const;
