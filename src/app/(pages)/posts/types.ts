/**
 * Type definitions for the Posts module
 */

export interface Author {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
}

export interface PostWithRelations {
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

export interface PostsApiResponse {
  posts: PostWithRelations[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface Comment {
  id: string;
  content: string;
  imageUrls: string[];
  authorId: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  isLiked?: boolean;
  isDisliked?: boolean;
  _count: {
    likes: number;
    dislikes: number;
  };
}
