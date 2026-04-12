import type { AboutContent, AboutItem, CreateAboutDTO, UpdateAboutDTO } from "../types/about.type";
import type { ApiResponse } from "../types/apiResponse";
import type { AxiosBaseQueryError } from "./axiosInstance/axiosBaseQuery";
import { createBaseApiFactory } from "./axiosInstance/baseFactory";

export const aboutService = createBaseApiFactory<
  AboutItem,
  CreateAboutDTO,
  UpdateAboutDTO,
  "About"
>({
  resource: "/site-configs/about",
  tag: "About",
  baseUrl: "admin",
});

const aboutExtraApi = aboutService.injectEndpoints({
  overrideExisting: "throw",
  endpoints: (builder) => ({
    getAbout: builder.query<AboutItem | null, void>({
      query: () => ({
        url: "/site-configs/about",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<AboutItem>) => response?.data || null,
      transformErrorResponse: (error: AxiosBaseQueryError) => {
        console.error("getAbout failed:", error);
        return error;
      },
    }),
    createAboutUpsert: builder.mutation<AboutContent, CreateAboutDTO>({
      query: (data) => ({
        url: "/site-configs/about/upsert",
        method: "POST",
        data,
      }),
      transformResponse: (response: ApiResponse<AboutContent>) => response?.data as AboutContent,
      transformErrorResponse: (error: AxiosBaseQueryError) => {
        console.error("createAboutUpsert failed:", error);
        return error;
      },
    }),
  }),
});

export const { useGetAboutQuery, useCreateAboutUpsertMutation } = aboutExtraApi;
