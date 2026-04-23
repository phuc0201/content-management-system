import { SYSTEM_CONSTANT } from "../constants/system.constant";
import type { ApiResponse } from "../types/apiResponse";
import type { SiteConfigItem, UpsertSiteConfigBody } from "../types/siteConfig.type";
import type { AxiosBaseQueryError } from "./axiosInstance/axiosBaseQuery";
import { createBaseApiFactory } from "./axiosInstance/baseFactory";

type SiteConfigListResponse = ApiResponse<SiteConfigItem[]>;

const getSiteConfigCacheKey = () => SYSTEM_CONSTANT.SITE_CONFIG;

const readSiteConfigCache = (): SiteConfigListResponse | null => {
  if (typeof window === "undefined") return null;

  const cachedValue = window.localStorage.getItem(getSiteConfigCacheKey());
  if (!cachedValue) return null;

  try {
    const parsed = JSON.parse(cachedValue) as SiteConfigListResponse | null;
    if (!parsed || !Array.isArray(parsed.data)) return null;
    return parsed;
  } catch (error) {
    console.error("Failed to parse site config cache:", error);
    return null;
  }
};

const writeSiteConfigCache = (response: SiteConfigListResponse) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(getSiteConfigCacheKey(), JSON.stringify(response));
};

const upsertSiteConfigItem = (items: SiteConfigItem[], nextItem: SiteConfigItem, type?: string) => {
  const nextItems = [...items];
  const byIdIndex = nextItems.findIndex((item) => item.id === nextItem.id);
  const byTypeIndex = type ? nextItems.findIndex((item) => item.type === type) : -1;
  const index = byIdIndex !== -1 ? byIdIndex : byTypeIndex;

  if (index !== -1) {
    nextItems[index] = nextItem;
    return nextItems;
  }

  nextItems.push(nextItem);
  return nextItems;
};

export const siteConfigService = createBaseApiFactory<any, any, any>({
  resource: "/site-configs",
  tag: "SiteConfig",
  baseUrl: "admin",
});

const siteConfigExtraApi = siteConfigService.injectEndpoints({
  overrideExisting: "throw",
  endpoints: (builder) => ({
    getSiteConfigs: builder.query<SiteConfigListResponse, {}>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const cachedResponse = readSiteConfigCache();
        if (cachedResponse) {
          return { data: cachedResponse };
        }

        const result = await baseQuery({
          url: "/site-configs",
          method: "GET",
        });

        if ("error" in result) {
          return {
            error:
              result.error ??
              ({
                status: "CUSTOM_ERROR",
                error: "Failed to fetch site configs",
              } as AxiosBaseQueryError),
          };
        }

        const response = result.data as SiteConfigListResponse;
        if (response?.data) {
          writeSiteConfigCache(response);
        }

        if (!response) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: "Empty site config response",
            },
          };
        }

        return { data: response };
      },
    }),

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

          const cachedResponse = readSiteConfigCache();
          const nextResponse: SiteConfigListResponse = cachedResponse ?? {
            success: true,
            data: [],
            meta: {
              timestamp: new Date().toISOString(),
              path: "/site-configs",
            },
          };

          nextResponse.data = upsertSiteConfigItem(nextResponse.data ?? [], newItem, type);
          nextResponse.meta = {
            ...nextResponse.meta,
            timestamp: new Date().toISOString(),
          };

          writeSiteConfigCache(nextResponse);

          dispatch(
            siteConfigExtraApi.util.updateQueryData("getSiteConfigs", {}, (draft) => {
              if (!draft?.data) return;

              draft.data = nextResponse.data;
              draft.meta = nextResponse.meta;
              draft.success = nextResponse.success;
              draft.error = nextResponse.error;
            }),
          );
        } catch {
          // keep cache unchanged on error
        }
      },
    }),
  }),
});

export const { useGetSiteConfigsQuery, useUpsertSiteConfigByTypeMutation } = siteConfigExtraApi;
