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
    upsertSiteConfigByType: builder.mutation<
      SiteConfigItem | null,
      { type: string; body: UpsertSiteConfigBody }
    >({
      query: ({ type, body }) => ({
        url: `/site-configs/${type}/upsert`,
        method: "POST",
        data: body,
      }),
      transformResponse: (response: ApiResponse<SiteConfigItem>) => response?.data || null,
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
        } catch {
          // keep cache unchanged on error
        }
      },
    }),
  }),
});

export const { useGetListQuery: useGetSiteConfigsQuery, useUpsertSiteConfigByTypeMutation } =
  siteConfigExtraApi;
