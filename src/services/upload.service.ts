import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse } from "../types/apiResponse";
import { axiosBaseQuery } from "./axiosInstance/axiosBaseQuery";

export const uploadImageService = createApi({
  reducerPath: "uploadImageService",
  baseQuery: axiosBaseQuery({ baseUrl: "admin" }),
  tagTypes: ["UploadImage"],
  endpoints: (build) => ({
    uploadImage: build.mutation<
      ApiResponse<any>,
      { files: File[]; id: number | string; type: string }
    >({
      query: ({ files, id, type }) => {
        const formData = new FormData();
        formData.append("type", type);
        formData.append("ownerId", String(id));
        files.forEach((file) => formData.append("files", file));
        return {
          url: `/uploads`,
          method: "POST",
          data: formData,
        };
      },
      transformErrorResponse: (response: any) => {
        return response.data || { message: "Error uploading image" };
      },
    }),

    deleteImage: build.mutation<ApiResponse<any>, { id: string }>({
      query: ({ id }) => ({
        url: `/uploads/${id}`,
        method: "DELETE",
      }),
      transformErrorResponse: (response: any) => {
        return response.data || { message: "Error deleting image" };
      },
    }),
  }),
});

export const { useUploadImageMutation, useDeleteImageMutation } = uploadImageService;
