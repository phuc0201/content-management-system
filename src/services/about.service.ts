import type { AboutItem, CreateAboutDTO, UpdateAboutDTO } from "../types/about.type";
import type { ApiResponse } from "../types/apiResponse";
import type { AxiosBaseQueryError } from "./axiosInstance/axiosBaseQuery";
import { createBaseApiFactory } from "./axiosInstance/baseFactory";

export const aboutService = createBaseApiFactory<
  AboutItem,
  CreateAboutDTO,
  UpdateAboutDTO,
  "About"
>({
  resource: "/abouts",
  tag: "About",
  baseUrl: "admin",
});

const aboutExtraApi = aboutService.injectEndpoints({
  overrideExisting: "throw",
  endpoints: (builder) => ({
    getAbout: builder.query<AboutItem | null, void>({
      query: () => ({
        url: "/abouts",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<AboutItem>) => response?.data || null,
      transformErrorResponse: (error: AxiosBaseQueryError) => {
        console.error("getAbout failed:", error);
        return error;
      },
    }),
  }),
});

export const {
  useGetAboutQuery,
  useCreateMutation: useCreateAboutMutation,
  useUpdateMutation: useUpdateAboutMutation,
} = aboutExtraApi;
