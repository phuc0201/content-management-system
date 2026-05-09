import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse } from "../types/apiResponse";
import type { SiteConfigImage } from "../types/siteConfig.type";
import { compressAndConvertMultipleImages } from "../utils/imageCompressor";
import { axiosBaseQuery } from "./axiosInstance/axiosBaseQuery";
import { siteConfigService } from "./siteConfig.service";

export const uploadImageService = createApi({
  reducerPath: "uploadImageService",
  baseQuery: axiosBaseQuery({ baseUrl: "admin" }),
  tagTypes: ["UploadImage"],
  endpoints: (build) => ({
    uploadImage: build.mutation<
      ApiResponse<any>,
      { files: File[]; id: number | string; type: string; quality?: number; siteConfigId?: string }
    >({
      queryFn: async (
        { files, id, type, quality = 1 },
        _api,
        _extraOptions,
        baseQuery,
      ): Promise<any> => {
        const formData = new FormData();
        formData.append("type", type);
        formData.append("ownerId", String(id));
        const processedFiles: File[] =
          quality === 1 ? files : await compressAndConvertMultipleImages(files, { quality });

        processedFiles.forEach((file) => formData.append("files", file));

        return baseQuery({
          url: `/uploads`,
          method: "POST",
          data: formData,
        });
      },
      async onQueryStarted(args, { queryFulfilled, dispatch }) {
        const { siteConfigId } = args;
        try {
          const { data: uploadData } = await queryFulfilled;

          if (siteConfigId) {
            dispatch(
              siteConfigService.util.updateQueryData("getList", {}, (draft) => {
                if (!draft?.data) return;
                const targetConfig = draft.data.find((item) => item.id === siteConfigId);
                if (!targetConfig) return;
                if (uploadData?.data?.length === 0) return;

                const uploadedImages = (uploadData as any)?.data[0];

                if (!uploadedImages) return;

                targetConfig.images.push(uploadedImages as SiteConfigImage);
              }),
            );
          }
        } catch (error) {
          console.error("Failed to upload image:", error);
        }
      },
    }),

    deleteImage: build.mutation<ApiResponse<any>, { id: string; siteConfigId?: string }>({
      query: ({ id }) => ({
        url: `/uploads/${id}`,
        method: "DELETE",
      }),
      transformErrorResponse: (response: any) => {
        return response.data || { message: "Error deleting image" };
      },
      async onQueryStarted(args, { queryFulfilled, dispatch }) {
        const { id, siteConfigId } = args;
        try {
          await queryFulfilled;
          if (siteConfigId) {
            dispatch(
              siteConfigService.util.updateQueryData("getList", {}, (draft) => {
                if (!draft?.data) return;

                const targetConfig = draft.data.find((item) => item.id === siteConfigId);
                if (!targetConfig) return;
                if (!targetConfig.images) return;

                targetConfig.images = targetConfig.images.filter(
                  (img: SiteConfigImage) => img.id !== id,
                );
              }),
            );
          }
        } catch (error) {
          console.error("Failed to delete image:", error);
        }
      },
    }),
  }),
});

export const { useUploadImageMutation, useDeleteImageMutation } = uploadImageService;
