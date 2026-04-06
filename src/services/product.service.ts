import type { CreateProductDTO, Product, UpdateProductDTO } from "../types/product.type";
import type { AxiosBaseQueryError } from "./axiosInstance/axiosBaseQuery";
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

const productServiceExtra = productService.injectEndpoints({
  overrideExisting: "throw",
  endpoints: (builder) => ({
    updateImage: builder.mutation<Product, { id: string | number; files: File[] }>({
      query: ({ id, files }) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("file", file));
        return {
          url: `products/${id}/imgs`,
          method: "PATCH",
          data: formData,
        };
      },
      transformErrorResponse: (error: AxiosBaseQueryError) => {
        console.error("updateImage failed:", error);
        return error;
      },
    }),
  }),
});

export const {
  useGetListQuery: useGetProductsQuery,
  useGetByIdQuery: useGetProductByIdQuery,
  useRemoveMutation: useRemoveProductMutation,
  useCreateMutation: useCreateProductMutation,
  useUpdateMutation: useUpdateProductMutation,
  useUpdateImageMutation,
} = productServiceExtra;
