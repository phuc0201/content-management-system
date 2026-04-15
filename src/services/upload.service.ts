import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse } from "../types/apiResponse";
import { axiosBaseQuery } from "./axiosInstance/axiosBaseQuery";

export const uploadImageService = createApi({
  reducerPath: "uploadImageService",
  baseQuery: axiosBaseQuery({ baseUrl: "admin" }),
  tagTypes: ["UploadImage"],
  endpoints: (build) => ({
    uploadImage: build.mutation<ApiResponse<any>, { files: File[]; id: number; type: string }>({
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
    }),
  }),
});

export const { useUploadImageMutation } = uploadImageService;
