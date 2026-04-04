import { API_TAG } from "../constants/apiTag.constant";
import type { DeleteUploadedAssetResponse, UploadedAsset } from "../types/upload.type";
import { baseApi } from "./base.service";
import { unwrapItem, unwrapList } from "./responseAdapter";

export const uploadApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        uploadAdminFile: builder.mutation<UploadedAsset, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append("file", file);

                return {
                    url: "/admin/upload",
                    method: "POST",
                    data: formData,
                };
            },
            transformResponse: unwrapItem,
            invalidatesTags: [API_TAG.UPLOADS],
        }),

        deleteAdminFile: builder.mutation<DeleteUploadedAssetResponse, string>({
            query: (id) => ({
                url: `/admin/upload/${id}`,
                method: "DELETE",
            }),
            transformResponse: unwrapItem,
            invalidatesTags: [API_TAG.UPLOADS],
        }),

        getAdminUploadTrash: builder.query<UploadedAsset[], void>({
            query: () => ({
                url: "/admin/trash",
                method: "GET",
            }),
            transformResponse: unwrapList,
            providesTags: [API_TAG.UPLOADS],
        }),
    }),
});

export const { useUploadAdminFileMutation, useDeleteAdminFileMutation, useGetAdminUploadTrashQuery } =
    uploadApi;
