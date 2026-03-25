export interface Product extends Record<string, unknown> {
  id: number;
  name: string;
  price: number;
  stock: number;
  status: string;
}

export interface CreateProductDTO extends Omit<Product, "id"> {}

export interface UpdateProductDTO extends Partial<Product> {}
