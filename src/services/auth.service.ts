import type { ApiResponse } from "../types/apiResponse";
import type { LoginRequest, LoginResponse } from "../types/auth.type";
import { setAccessToken } from "../utils/authHelpers";
import type { AxiosBaseQueryError } from "./axiosInstance/axiosBaseQuery";
import { baseApi } from "./base.service";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signIn: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: ApiResponse<LoginResponse>) => {
        const token = response?.data?.accessToken;
        if (token) setAccessToken(token);

        return response.data || { accessToken: "" };
      },
      transformErrorResponse: (error: AxiosBaseQueryError) => {
        console.error("loginAuth error:", error);
        return error;
      },
    }),

    fetchAdminCurrent: builder.query({
      query: () => ({
        url: "/auth/me",
      }),
      transformResponse: (response) => {
        return response?.data;
      },
      transformErrorResponse: (error: AxiosBaseQueryError) => {
        console.error("fetch admin current failed: ", error);
        return error;
      },
    }),
  }),
});

export const { useSignInMutation, useFetchAdminCurrentQuery } = authApi;
