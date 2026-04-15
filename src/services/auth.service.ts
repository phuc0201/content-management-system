import type { ApiResponse } from "../types/apiResponse";
import type { LoginRequest, LoginResponse } from "../types/auth.type";
import { setAccessToken } from "../utils/authHelpers";
import type { AxiosBaseQueryError } from "./axiosInstance/axiosBaseQuery";
import { createBaseApiFactory } from "./axiosInstance/baseFactory";

type AdminCurrent = Record<string, unknown>;

export const authService = createBaseApiFactory<
  Record<string, unknown>,
  Record<string, unknown>,
  Record<string, unknown>,
  "Auth"
>({
  resource: "/auth",
  tag: "Auth",
});

const authApi = authService.injectEndpoints({
  overrideExisting: "throw",
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
        console.error("signIn failed:", error);
        return error;
      },
    }),

    fetchAdminCurrent: builder.query<AdminCurrent | null, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<AdminCurrent>) => response?.data || null,
      transformErrorResponse: (error: AxiosBaseQueryError) => {
        console.error("fetchAdminCurrent failed:", error);
        return error;
      },
    }),
  }),
});

export const authReducer = authService.reducer;
export const authReducerPath = authService.reducerPath;
export const authMiddleware = authService.middleware;

export const { useSignInMutation, useFetchAdminCurrentQuery } = authApi;
