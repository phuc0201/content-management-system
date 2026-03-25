import { API_TAG } from "../constants/apiTag.constant";
import type { Blog, CreateBlogDTO, UpdateBlogDTO } from "../types/blog.type";
import { baseApi, BaseFactory } from "./base.service";

class BlogFactory extends BaseFactory<Blog, CreateBlogDTO, UpdateBlogDTO> {
  constructor() {
    super("/blog", API_TAG.BLOGS);
  }
}

const factory = new BlogFactory();

export const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    ...factory.build(builder),
  }),
});

export const {
  useGetListQuery: useGetBlogsQuery,
  useGetByIdQuery: useGetBlogByIdQuery,
  useCreateMutation: useCreateBlogMutation,
  useUpdateMutation: useUpdateBlogMutation,
  useRemoveMutation: useRemoveBlogMutation,
} = blogApi;
