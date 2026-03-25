import { API_TAG } from "../constants/apiTag.constant";
import type { CreateProductDTO, Product, UpdateProductDTO } from "../types/product.type";
import { baseApi, BaseFactory } from "./base.service";
import { products } from "../dummy-data/products.data";
import { buildParams } from "../utils/queryHelpers";

class ProductFactory extends BaseFactory<Product, CreateProductDTO, UpdateProductDTO> {
  constructor() {
    super("/products", API_TAG.PRODUCTS);
  }
}

const factory = new ProductFactory();

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    ...factory.build(builder),
    fetchProductsWithMockData: builder.query({
      queryFn: (args) => {
        const param = buildParams(args);
        console.log("[PRODUCT] ~ PARAM: ", param);

        return {
          data: {
            data: products,
            meta: {
              path: "/products",
              totalItem: 20,
              totalPage: 10,
              pageSize: 10,
              current: 1,
            },
          },
        };
      },
    }),
  }),
});

export const {
  useFetchProductsWithMockDataQuery,
  useGetListQuery: useGetProductsQuery,
  useGetByIdQuery: useGetProductByIdQuery,
  useCreateMutation: useCreateProductMutation,
  useUpdateMutation: useUpdateProductMutation,
  useRemoveMutation: useRemoveProductMutation,
} = productApi;
