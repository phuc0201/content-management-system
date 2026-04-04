import { API_TAG } from "../constants/apiTag.constant";
import type { Category, CreateCategoryDTO, UpdateCategoryDTO } from "../types/category.type";
import { baseApi, BaseFactory } from "./base.service";

class CategoryFactory extends BaseFactory<Category, CreateCategoryDTO, UpdateCategoryDTO> {
    constructor() {
        super("/admin/categories", API_TAG.CATEGORIES);
    }
}

class PublicCategoryFactory extends BaseFactory<Category, CreateCategoryDTO, UpdateCategoryDTO> {
    constructor() {
        super("/categories", API_TAG.CATEGORIES);
    }
}

const factory = new CategoryFactory();
const publicFactory = new PublicCategoryFactory();

export const categoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => {
        const publicEndpoints = publicFactory.build(builder);

        return {
            ...factory.build(builder),
            getCategories: publicEndpoints.getList,
        };
    },
});

export const {
    useGetCategoriesQuery,
    useGetListQuery: useGetAdminCategoriesQuery,
    useCreateMutation: useCreateAdminCategoryMutation,
    useUpdateMutation: useUpdateAdminCategoryMutation,
    useRemoveMutation: useDeleteAdminCategoryMutation,
} = categoryApi;
