import type { Category } from "./category.type";

export interface Product extends Record<string, unknown> {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  salePrice?: number | null;
  summary?: string;
  thumbnailUrl?: string | null;
  categoryId?: string;
  category: Category;
  images?: ProductImage[];
  stock?: number;
  status?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  index: number;
}

export interface CreateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  salePrice?: number | null;
  categoryId?: number;
  summary?: string;
  thumbnailUrl?: string | null;
  isDraft?: boolean;
  img?: string[];
}

export type UpdateProductDTO = Partial<CreateProductDTO>;

export interface ProductListQuery {
  category?: number;
  offset?: number;
  limit?: number;
}

export interface PopularProductsQuery {
  limit?: number;
}
