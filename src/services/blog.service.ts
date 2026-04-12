import type { Blog, CreateBlogDTO, UpdateBlogDTO } from "../types/blog.type";
import { createBaseApiFactory } from "./axiosInstance/baseFactory";

export const blogService = createBaseApiFactory<Blog, CreateBlogDTO, UpdateBlogDTO, "Blog">({
  resource: "/blogs",
  tag: "Blog",
  baseUrl: "admin",
});

const blogServiceExtra = blogService.injectEndpoints({
  endpoints: (builder) => ({
    uploadBlogImage: builder.mutation<Blog, { id: string | number; file: File }>({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: `/blogs/${id}/img`,
          method: "PATCH",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };
      },
    }),
  }),
});

export const {
  useGetListQuery: useGetBlogsQuery,
  useGetByIdQuery: useGetBlogByIdQuery,
  useCreateMutation: useCreateBlogMutation,
  useUpdateMutation: useUpdateBlogMutation,
  useRemoveMutation: useRemoveBlogMutation,
  useUploadBlogImageMutation,
} = blogServiceExtra;
