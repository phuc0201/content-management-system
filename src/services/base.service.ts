import { createApi, type EndpointBuilder } from "@reduxjs/toolkit/query/react";
import { API_TAG } from "../constants/apiTag.constant";
import type { ApiResponse } from "../types/apiResponse";
import type { QueryParameter } from "../types/queryParameter";
import { buildParams } from "../utils/queryHelpers";
import { axiosBaseQuery } from "./axiosInstance/axiosBaseQuery";

type BaseQuery = ReturnType<typeof axiosBaseQuery>;
type AppTagTypes = (typeof API_TAG)[keyof typeof API_TAG];

export const baseApi = createApi({
  reducerPath: "cms",
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  tagTypes: Object.values(API_TAG),
  endpoints: () => ({}),
});

const PathEnum = {
  ABOUT: "abouts",
  CMS: "cms",
} as const;

type PathEnumType = (typeof PathEnum)[keyof typeof PathEnum];

export abstract class BaseFactory<TEntity extends Record<string, unknown>, TCreateDto, TUpdateDto> {
  protected readonly resource: string;
  protected readonly tag: AppTagTypes;

  constructor(resource: string, tag: AppTagTypes) {
    this.resource = resource;
    this.tag = tag;
  }

  protected toList(response: ApiResponse<TEntity[]>) {
    return response.data ?? [];
  }

  protected toItem(response: ApiResponse<TEntity>) {
    return response.data as TEntity;
  }

  build(builder: EndpointBuilder<BaseQuery, AppTagTypes, PathEnumType>) {
    return {
      getList: builder.query<TEntity[], QueryParameter<TEntity> | void>({
        query: (args) => ({
          url: this.resource,
          method: "GET",
          params: args ? buildParams(args) : undefined,
        }),
        transformResponse: (response: ApiResponse<TEntity[]>) => this.toList(response),
        providesTags: [this.tag],
      }),

      getById: builder.query<TEntity, string | number>({
        query: (id) => ({ url: `${this.resource}/${id}`, method: "GET" }),
        transformResponse: (response: ApiResponse<TEntity>) => this.toItem(response),
        providesTags: [this.tag],
      }),

      create: builder.mutation<TEntity, TCreateDto>({
        query: (body) => ({ url: this.resource, method: "POST", data: body }),
        transformResponse: (response: ApiResponse<TEntity>) => this.toItem(response),
        invalidatesTags: [this.tag],
      }),

      update: builder.mutation<TEntity, { id: string | number; body: TUpdateDto }>({
        query: ({ id, body }) => ({
          url: `${this.resource}/${id}`,
          method: "PATCH",
          data: body,
        }),
        transformResponse: (response: ApiResponse<TEntity>) => this.toItem(response),
        invalidatesTags: [this.tag],
      }),

      remove: builder.mutation<void, string | number>({
        query: (id) => ({ url: `${this.resource}/${id}`, method: "DELETE" }),
        invalidatesTags: [this.tag],
      }),
    };
  }
}
