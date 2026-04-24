import type { ApiResponse } from "../../types/apiResponse";
import type { QueryParameter } from "../../types/queryParameter";
import { buildParams } from "../../utils/queryHelpers";
import type { TaggedBuilder } from "./baseFactory";

export function buildBaseEndpoints<
  TEntity extends { id?: string | number },
  TCreateDTO,
  TUpdateDTO,
  TTag extends string,
>(builder: TaggedBuilder<TTag>, resource: string, tag: TTag) {
  return {
    getList: builder.query<ApiResponse<TEntity[]>, QueryParameter<TEntity>>({
      query: (args) => ({
        url: resource,
        method: "GET",
        params: buildParams(args),
      }),
      providesTags: (result) => [
        { type: tag, id: "LIST" },
        ...(result?.data ?? []).map((item) => ({ type: tag, id: item.id })),
      ],
    }),

    getById: builder.query<ApiResponse<TEntity>, string | number>({
      query: (id) => ({
        url: `${resource}/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: tag, id }],
    }),

    create: builder.mutation<ApiResponse<TEntity>, TCreateDTO>({
      query: (body) => ({
        url: resource,
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: tag, id: "LIST" }],
    }),

    update: builder.mutation<ApiResponse<TEntity>, { id: string | number; body: TUpdateDTO }>({
      query: ({ id, body }) => ({
        url: `${resource}/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: tag, id: id }],
    }),

    remove: builder.mutation<ApiResponse<void>, string | number>({
      query: (id) => ({
        url: `${resource}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: tag, id }],
    }),
  };
}
