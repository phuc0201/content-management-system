import type { Blog, CreateBlogDTO, UpdateBlogDTO } from "../types/blog.type";
import { createBaseApiFactory } from "./axiosInstance/baseFactory";

export const blogService = createBaseApiFactory<Blog, CreateBlogDTO, UpdateBlogDTO, "Blog">({
  resource: "/blogs",
  tag: "Blog",
  baseUrl: "admin",
});

export const {
  useGetListQuery: useGetBlogsQuery,
  useGetByIdQuery: useGetBlogByIdQuery,
  useCreateMutation: useCreateBlogMutation,
  useUpdateMutation: useUpdateBlogMutation,
  useRemoveMutation: useRemoveBlogMutation,
} = blogService;
