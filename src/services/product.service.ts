import { API_TAG } from "../constants/apiTag.constant";
import type {
  CreateProductDTO,
  PopularProductsQuery,
  Product,
  ProductImage,
  UpdateProductDTO,
} from "../types/product.type";
import { baseApi, BaseFactory } from "./base.service";
import { unwrapItem, unwrapList } from "./responseAdapter";

class ProductFactory extends BaseFactory<Product, CreateProductDTO, UpdateProductDTO> {
  constructor() {
    super("/admin/products", API_TAG.PRODUCTS);
  }
}

class PublicProductFactory extends BaseFactory<Product, CreateProductDTO, UpdateProductDTO> {
  constructor() {
    super("/products", API_TAG.PRODUCTS);
  }
}

const factory = new ProductFactory();
const publicFactory = new PublicProductFactory();

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => {
    const publicEndpoints = publicFactory.build(builder);

    return {
      ...factory.build(builder),
      getPublicProducts: publicEndpoints.getList,
      getPublicProductById: publicEndpoints.getById,
      getPublicProductsByCategory: builder.query<
        Product[],
        { cateId?: number; offset?: number; limit?: number } | void
      >({
        query: (params) => ({
          url: "/products",
          method: "GET",
          params,
        }),
        transformResponse: unwrapList,
        providesTags: [API_TAG.PRODUCTS],
      }),
      getPopularProducts: builder.query<Product[], PopularProductsQuery | void>({
        query: (params) => ({
          url: "/popular-products",
          method: "GET",
          params,
        }),
        transformResponse: unwrapList,
        providesTags: [API_TAG.PRODUCTS],
      }),

      uploadAdminProductImage: builder.mutation<ProductImage, { id: number; file: File }>({
        query: ({ id, file }) => {
          const formData = new FormData();
          formData.append("file", file);

          return {
            url: `/admin/products/${id}/imgs`,
            method: "PATCH",
            data: formData,
          };
        },
        transformResponse: unwrapItem,
        invalidatesTags: [API_TAG.PRODUCTS],
      }),
    };
  },
});

export const {
  useGetPublicProductsQuery,
  useGetPublicProductsByCategoryQuery,
  useGetPublicProductByIdQuery,
  useGetPopularProductsQuery,
  useGetListQuery: useGetAdminProductsQuery,
  useGetByIdQuery: useGetAdminProductByIdQuery,
  useCreateMutation: useCreateAdminProductMutation,
  useUpdateMutation: useUpdateAdminProductMutation,
  useRemoveMutation: useDeleteAdminProductMutation,
  useUploadAdminProductImageMutation,
  useGetListQuery: useGetProductsQuery,
  useGetByIdQuery: useGetProductByIdQuery,
  useCreateMutation: useCreateProductMutation,
  useUpdateMutation: useUpdateProductMutation,
  useRemoveMutation: useRemoveProductMutation,
} = productApi;
