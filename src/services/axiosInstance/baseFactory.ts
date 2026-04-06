import type { BaseQueryFn, EndpointBuilder } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import type { AxiosRequestConfig } from "axios";
import {
  axiosBaseQuery,
  type AxiosBaseQueryArgs,
  type AxiosBaseQueryError,
} from "./axiosBaseQuery";
import { buildBaseEndpoints } from "./baseEndpoints";

/* ─────────────────────────────────────────────────────────────
 * Builder Type
 * ─────────────────────────────────────────────────────────────
 * TagType phải carry TTag để TypeScript không erase về unknown
 * khi assign endpoint definition (providesTags, invalidatesTags)
 * */
export type TaggedBuilder<TTag extends string> = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  TTag,
  string
>;

export interface BaseApiFactoryOptions<
  TEntity extends Record<string, unknown>,
  TCreateDTO,
  TUpdateDTO,
  TTag extends string = string,
> {
  resource: string;
  tag: TTag;
  reducerPath?: string;
  baseUrl?: string;
  prepareHeaders?: (headers: AxiosRequestConfig["headers"]) => AxiosRequestConfig["headers"];
  extraTagTypes?: TTag[];
  overrideEndpoints?: (
    builder: TaggedBuilder<TTag>,
    ctx: { resource: string; tag: TTag },
  ) => Partial<ReturnType<typeof buildBaseEndpoints<TEntity, TCreateDTO, TUpdateDTO, TTag>>>;
}

export function createBaseApiFactory<
  TEntity extends Record<string, unknown>,
  TCreateDTO,
  TUpdateDTO,
  TTag extends string = string,
>(options: BaseApiFactoryOptions<TEntity, TCreateDTO, TUpdateDTO, TTag>) {
  const {
    resource,
    tag,
    reducerPath = `${tag}Api`,
    baseUrl = "",
    prepareHeaders,
    extraTagTypes = [] as unknown as TTag[],
    overrideEndpoints,
  } = options;

  return createApi({
    reducerPath,
    baseQuery: axiosBaseQuery({ baseUrl, prepareHeaders }),
    tagTypes: [tag, ...extraTagTypes] as [TTag, ...TTag[]],

    endpoints: (builder: TaggedBuilder<TTag>) => {
      const base = buildBaseEndpoints<TEntity, TCreateDTO, TUpdateDTO, TTag>(
        builder,
        resource,
        tag,
      );
      const overrides = overrideEndpoints?.(builder, { resource, tag }) ?? {};
      return { ...base, ...overrides };
    },
  });
}
