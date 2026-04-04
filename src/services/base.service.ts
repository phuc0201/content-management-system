import { createApi, type EndpointBuilder } from "@reduxjs/toolkit/query/react";
import { API_TAG } from "../constants/apiTag.constant";
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

export abstract class BaseFactory<TEntity extends Record<string, unknown>, TCreateDto, TUpdateDto> {
  protected readonly resource: string;
  protected readonly tag: AppTagTypes;

  constructor(resource: string, tag: AppTagTypes) {
    this.resource = resource;
    this.tag = tag;
  }

  build(builder: EndpointBuilder<BaseQuery, AppTagTypes, "cms">) {
    return {
      getList: builder.query<TEntity[], QueryParameter<TEntity>>({
        query: (args) => ({ url: this.resource, method: "GET", params: buildParams(args) }),
        providesTags: [this.tag],
      }),

      getById: builder.query<TEntity, string | number>({
        query: (id) => ({ url: `${this.resource}/${id}`, method: "GET" }),
        providesTags: [this.tag],
      }),

      create: builder.mutation<TEntity, TCreateDto>({
        query: (body) => ({ url: this.resource, method: "POST", data: body }),
        invalidatesTags: [this.tag],
      }),

      update: builder.mutation<TEntity, { id: string | number; body: TUpdateDto }>({
        query: ({ id, body }) => ({
          url: `${this.resource}/${id}`,
          method: "PATCH",
          data: body,
        }),
        invalidatesTags: [this.tag],
      }),

      remove: builder.mutation<void, string | number>({
        query: (id) => ({ url: `${this.resource}/${id}`, method: "DELETE" }),
        invalidatesTags: [this.tag],
      }),
    };
  }
}
