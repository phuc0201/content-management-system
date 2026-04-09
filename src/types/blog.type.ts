export interface Blog extends Record<string, unknown> {
  id: number;
  title: string;
  thumbnailUrl?: string | null;
  shortDescription?: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBlogDTO {
  title: string;
  content: string;
  shortDescription?: string;
  thumbnailUrl?: string | null;
}

export type UpdateBlogDTO = Partial<CreateBlogDTO>;

export interface BlogListQuery {
  offset?: number;
  limit?: number;
}

export interface BlogImageUploadResponse {
  success: boolean;
  id: number;
  url: string;
  blog: {
    id: number;
    title: string;
  };
}
