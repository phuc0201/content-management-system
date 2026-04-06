export interface Product extends Record<string, unknown> {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  salePrice?: number | null;
  summary?: string;
  thumbnailUrl?: string | null;
  categoryId?: number;
  category?: string;
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
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number | null;
  category: string;
  summary: string;
  thumbnailUrl?: string | null;
}

export type UpdateProductDTO = Partial<CreateProductDTO>;

export interface ProductListQuery {
  cateId?: number;
  offset?: number;
  limit?: number;
}

export interface PopularProductsQuery {
  limit?: number;
}
