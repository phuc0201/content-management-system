import type { ApiResponse } from "../types/apiResponse";
import type { SiteConfigItem, UpsertSiteConfigBody } from "../types/siteConfig.type";
import type { AxiosBaseQueryError } from "./axiosInstance/axiosBaseQuery";
import { createBaseApiFactory } from "./axiosInstance/baseFactory";

export const siteConfigService = createBaseApiFactory<any, any, any>({
  resource: "/site-configs",
  tag: "SiteConfig",
  baseUrl: "admin",
});

const siteConfigExtraApi = siteConfigService.injectEndpoints({
  overrideExisting: "throw",
  endpoints: (builder) => ({
    createSiteConfig: builder.mutation<SiteConfigItem, Omit<SiteConfigItem, "id">>({
      query: ({ type, ...body }) => ({
        url: `${`/site-configs/${type}`}`,
        method: "POST",
        data: body,
      }),
      transformResponse: (response: ApiResponse<SiteConfigItem>) =>
        response?.data as SiteConfigItem,
      transformErrorResponse: (error: AxiosBaseQueryError) => {
        console.error("createSiteConfig failed:", error);
        return error;
      },
      async onQueryStarted({}, { dispatch, queryFulfilled }) {
        try {
          const { data: newItem } = await queryFulfilled;
          if (!newItem) return;

          dispatch(
            siteConfigService.util.updateQueryData("getList", {}, (draft) => {
              if (!draft?.data) return;
              draft.data.push(newItem);
            }),
          );
        } catch (error) {
          console.error("Failed to create site config:", error);
        }
      },
    }),

    updateSiteConfig: builder.mutation<SiteConfigItem, SiteConfigItem>({
      query: ({ id, type, ...body }) => ({
        url: `/site-configs/${type}/${id}`,
        method: "PUT",
        data: body,
      }),
      transformResponse: (response: ApiResponse<SiteConfigItem>) =>
        response?.data as SiteConfigItem,
      transformErrorResponse: (error: AxiosBaseQueryError) => {
        console.error("updateSiteConfig failed:", error);
        return error;
      },
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedItem } = await queryFulfilled;
          if (!updatedItem) return;

          dispatch(
            siteConfigService.util.updateQueryData("getList", {}, (draft) => {
              if (!draft?.data) return;
              const index = draft.data.findIndex((item) => item.id === id);
              if (index !== -1) {
                draft.data[index] = updatedItem;
              }
            }),
          );
        } catch (error) {
          console.error("Failed to update site config cache after update:", error);
        }
      },
    }),

    deleteSiteConfig: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/site-configs/${id}`,
        method: "DELETE",
      }),
      transformErrorResponse: (error: AxiosBaseQueryError) => {
        console.error("deleteSiteConfig failed:", error);
        return error;
      },
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            siteConfigService.util.updateQueryData("getList", {}, (draft) => {
              if (!draft?.data) return;
              const index = draft.data.findIndex((item) => item.id === id);
              if (index !== -1) {
                draft.data.splice(index, 1);
              }
            }),
          );
        } catch (error) {
          console.error("Failed to update site config cache after deletion:", error);
        }
      },
    }),

    upsertSiteConfigByType: builder.mutation<
      SiteConfigItem,
      { type: string; body: UpsertSiteConfigBody }
    >({
      query: ({ type, body }) => ({
        url: `/site-configs/${type}/upsert`,
        method: "POST",
        data: body,
      }),
      transformResponse: (response: ApiResponse<SiteConfigItem>) =>
        response?.data as SiteConfigItem,
      transformErrorResponse: (error: AxiosBaseQueryError) => {
        console.error("upsertSiteConfigByType failed:", error);
        return error;
      },
      async onQueryStarted({ type }, { dispatch, queryFulfilled }) {
        try {
          const { data: newItem } = await queryFulfilled;
          if (!newItem) return;

          dispatch(
            siteConfigService.util.updateQueryData("getList", {}, (draft) => {
              if (!draft?.data) return;

              const index = draft.data.findIndex((item) => item.type === type);

              if (index !== -1) {
                draft.data[index] = newItem;
              } else {
                draft.data.push(newItem);
              }
            }),
          );
        } catch (error) {
          console.error("Failed to update site config cache after upsert:", error);
        }
      },
    }),
  }),
});

export const {
  useGetListQuery: useGetSiteConfigsQuery,
  useCreateSiteConfigMutation,
  useUpdateSiteConfigMutation,
  useUpsertSiteConfigByTypeMutation,
  useDeleteSiteConfigMutation,
} = siteConfigExtraApi;
