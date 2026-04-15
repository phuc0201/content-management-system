import type { CreateProductDTO, Product, UpdateProductDTO } from "../types/product.type";
import { createBaseApiFactory } from "./axiosInstance/baseFactory";

export const productService = createBaseApiFactory<
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  "Product"
>({
  resource: "/products",
  tag: "Product",
  baseUrl: "admin",
});

export const {
  useGetListQuery: useGetProductsQuery,
  useGetByIdQuery: useGetProductByIdQuery,
  useRemoveMutation: useRemoveProductMutation,
  useCreateMutation: useCreateProductMutation,
  useUpdateMutation: useUpdateProductMutation,
} = productService;
