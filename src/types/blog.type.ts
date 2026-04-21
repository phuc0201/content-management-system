export interface Blog extends Record<string, unknown> {
  id: number;
  title: string;
  thumbnailUrl?: string | null;
  shortDescription?: string;
  images?: BlogImage[];
  content: string;
  isDraft: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogImage {
  id?: string;
  url?: string;
  filePath?: string;
  scope?: string;
  productId?: number;
  blogId?: number | null;
  policyId?: number | null;
  siteConfigId?: number | null;
  alt?: string | null;
  index?: number;
  active?: boolean;
  deleted?: boolean;
}

export interface CreateBlogDTO {
  title?: string;
  content?: string;
  shortDescription?: string;
  thumbnailUrl?: string | null;
  isDraft?: boolean;
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
