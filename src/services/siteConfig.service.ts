import type { ApiResponse } from "../types/apiResponse";
import type { AxiosBaseQueryError } from "./axiosInstance/axiosBaseQuery";
import { createBaseApiFactory } from "./axiosInstance/baseFactory";

export type SiteConfigItem = {
  id: string;
  type: string;
  text?: string | null;
  title?: string | null;
  content?: string | null;
  link?: string | null;
  imageId?: string | null;
  image?: unknown;
  active?: boolean;
  index?: number | null;
};

export type UpsertSiteConfigBody = {
  text?: string;
  title?: string;
  content?: string;
  imageId?: string;
  link?: string;
};

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
      transformResponse: (response: ApiResponse<SiteConfigItem>) => response?.data ?? null,
      transformErrorResponse: (error: AxiosBaseQueryError) => {
        console.error("upsertSiteConfigByType failed:", error);
        return error;
      },
      invalidatesTags: ["SiteConfig"],
    }),
  }),
});

export const {
  useGetListQuery: useGetSiteConfigListQuery,
  useUpdateMutation: useUpdateSiteConfigMutation,
  useCreateMutation: useCreateSiteConfigMutation,
  useUpsertSiteConfigByTypeMutation,
} = siteConfigExtraApi;
