import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosError, AxiosRequestConfig } from "axios";
import axios from "./axios";

export type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  headers?: AxiosRequestConfig["headers"];
  useBaseUrl?: boolean;
};

export type AxiosBaseQueryError =
  | {
      status: number;
      data: unknown;
    }
  | {
      status: "FETCH_ERROR";
      error: string;
    }
  | {
      status: "CUSTOM_ERROR";
      error: string;
      data?: unknown;
    };

const toBaseQueryError = (error: AxiosError): AxiosBaseQueryError => {
  if (error.response) {
    return {
      status: error.response.status,
      data: error.response.data,
    };
  }

  if (error.request) {
    return {
      status: "FETCH_ERROR",
      error: error.message || "Network error",
    };
  }

  return {
    status: "CUSTOM_ERROR",
    error: error.message || "Unknown error",
  };
};

export const axiosBaseQuery =
  (
    {
      baseUrl,
      prepareHeaders,
    }: {
      baseUrl?: string;
      prepareHeaders?: (headers: AxiosRequestConfig["headers"]) => AxiosRequestConfig["headers"];
    } = { baseUrl: "", prepareHeaders: undefined },
  ): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> =>
  async ({ url, method, data, params, headers, useBaseUrl }) => {
    try {
      const result = await axios({
        url: useBaseUrl !== false ? (baseUrl || "") + url : url,
        method,
        data,
        params,
        headers: prepareHeaders ? prepareHeaders(headers) : headers,
      });

      return { data: result.data };
    } catch (rawError) {
      const err = rawError as AxiosError;
      return {
        error: toBaseQueryError(err),
      };
    }
  };
