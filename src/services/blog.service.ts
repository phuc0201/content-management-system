import { API_TAG } from "../constants/apiTag.constant";
import type { Blog, CreateBlogDTO, UpdateBlogDTO } from "../types/blog.type";
import { baseApi, BaseFactory } from "./base.service";

class BlogFactory extends BaseFactory<Blog, CreateBlogDTO, UpdateBlogDTO> {
  constructor() {
    super("/admin/blogs", API_TAG.BLOGS);
  }
}

class PublicBlogFactory extends BaseFactory<Blog, CreateBlogDTO, UpdateBlogDTO> {
  constructor() {
    super("/blogs", API_TAG.BLOGS);
  }
}

const factory = new BlogFactory();
const publicFactory = new PublicBlogFactory();

export const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => {
    const publicEndpoints = publicFactory.build(builder);

    return {
      ...factory.build(builder),
      getPublicBlogs: publicEndpoints.getList,
      getPublicBlogById: publicEndpoints.getById,
    };
  },
});

export const {
  useGetPublicBlogsQuery,
  useGetPublicBlogByIdQuery,
  useGetListQuery: useGetBlogsQuery,
  useGetByIdQuery: useGetBlogByIdQuery,
  useCreateMutation: useCreateBlogMutation,
  useUpdateMutation: useUpdateBlogMutation,
  useRemoveMutation: useRemoveBlogMutation,
} = blogApi;
