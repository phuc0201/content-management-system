import type { ApiResponse } from "../types/apiResponse";
import type { Blog, CreateBlogDTO, UpdateBlogDTO } from "../types/blog.type";
import type { AxiosBaseQueryError } from "./axiosInstance/axiosBaseQuery";
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
          url: `/blogs/${id}/thumbnail`,
          method: "PATCH",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };
      },
    }),

    getBlogById: builder.query<ApiResponse<Blog>, string | number>({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: "GET",
        useBaseUrl: false,
      }),
      transformErrorResponse: (error: AxiosBaseQueryError) => {
        console.error("getById failed:", error);
        return error;
      },
      providesTags: ["Blog"],
    }),
  }),
});

export const {
  useGetListQuery: useGetBlogsQuery,
  useCreateMutation: useCreateBlogMutation,
  useUpdateMutation: useUpdateBlogMutation,
  useRemoveMutation: useRemoveBlogMutation,
  useUploadBlogImageMutation,
  useGetBlogByIdQuery,
} = blogServiceExtra;
