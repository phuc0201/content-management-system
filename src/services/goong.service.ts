import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GoongGeocodeResponse } from "../types/goong.type";

const GOONG_BASE_URL = "https://rsapi.goong.io";

type GoongSearchAddressArg = {
  address: string;
};

export const goongService = createApi({
  reducerPath: "goongApi",
  baseQuery: fetchBaseQuery({
    baseUrl: GOONG_BASE_URL,
  }),
  endpoints: (builder) => ({
    goongSearchAddress: builder.query<GoongGeocodeResponse, GoongSearchAddressArg>({
      query: ({ address }) => ({
        url: "/geocode",
        params: {
          address,
          api_key: import.meta.env.VITE_GOONG_API_KEY,
        },
      }),
      transformResponse: (response: Partial<GoongGeocodeResponse>) => ({
        status: response.status ?? "UNKNOWN",
        results: response.results ?? [],
      }),
      transformErrorResponse: (error) => {
        console.error("goongSearchAddress failed:", error);
        return error;
      },
    }),
  }),
});

export const { useGoongSearchAddressQuery } = goongService;
