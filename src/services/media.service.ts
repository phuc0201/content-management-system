import { createBaseApiFactory } from "./axiosInstance/baseFactory";

export const mediaService = createBaseApiFactory<any, any, any, "Media">({
  resource: "/upload",
  tag: "Media",
  baseUrl: "admin",
});

const mediaServiceExtra = mediaService.injectEndpoints({
  overrideExisting: "throw",
  endpoints: (builder) => ({
    uploadImage: builder.mutation<any, { file: File }>({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: "/upload",
          method: "POST",
          data: formData,
        };
      },
      transformResponse: (response: any) => {
        return response.data;
      },
      transformErrorResponse: (error: any) => {
        console.error("uploadImage failed:", error);
        return error;
      },
    }),

    deleteImage: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/upload`,
        method: "DELETE",
        params: { id },
      }),
      transformErrorResponse: (error: any) => {
        console.error("deleteImage failed:", error);
        return error;
      },
    }),
  }),
});

export const { useUploadImageMutation, useDeleteImageMutation } = mediaServiceExtra;
