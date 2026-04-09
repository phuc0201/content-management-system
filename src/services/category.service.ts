import type { Category, CreateCategoryDTO, UpdateCategoryDTO } from "../types/category.type";
import { createBaseApiFactory } from "./axiosInstance/baseFactory";

export const categoryService = createBaseApiFactory<
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  "Category"
>({
  resource: "/categories",
  tag: "Category",
  baseUrl: "admin",
});

export const {
  useGetListQuery: useGetCategoriesQuery,
  useRemoveMutation: useRemoveCategoryMutation,
  useCreateMutation: useCreateCategoryMutation,
  useUpdateMutation: useUpdateCategoryMutation,
} = categoryService;
