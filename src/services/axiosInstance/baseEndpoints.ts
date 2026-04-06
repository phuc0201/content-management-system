import type { ApiResponse } from "../../types/apiResponse";
import type { QueryParameter } from "../../types/queryParameter";
import { buildParams } from "../../utils/queryHelpers";
import type { AxiosBaseQueryError } from "./axiosBaseQuery";
import type { TaggedBuilder } from "./baseFactory";

export function buildBaseEndpoints<
  TEntity extends Record<string, unknown>,
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
      transformErrorResponse: (error: AxiosBaseQueryError) => {
        console.error("getList failed:", error);
        return error;
      },
      providesTags: [tag],
    }),

    getById: builder.query<ApiResponse<TEntity>, string | number>({
      query: (id) => ({
        url: `${resource}/${id}`,
        method: "GET",
      }),
      transformErrorResponse: (error: AxiosBaseQueryError) => {
        console.error("getById failed:", error);
        return error;
      },
      providesTags: [tag],
    }),

    create: builder.mutation<ApiResponse<TEntity>, TCreateDTO>({
      query: (body) => ({
        url: resource,
        method: "POST",
        data: body,
      }),
      transformErrorResponse: (error: AxiosBaseQueryError) => {
        console.error("create failed:", error);
        return error;
      },
      invalidatesTags: [tag],
    }),

    update: builder.mutation<ApiResponse<TEntity>, { id: string | number; body: TUpdateDTO }>({
      query: ({ id, body }) => ({
        url: `${resource}/${id}`,
        method: "PATCH",
        data: body,
      }),
      transformErrorResponse: (error: AxiosBaseQueryError) => {
        console.error("update failed:", error);
        return error;
      },
      invalidatesTags: [tag],
    }),

    remove: builder.mutation<ApiResponse<void>, string | number>({
      query: (id) => ({
        url: `${resource}/${id}`,
        method: "DELETE",
      }),
      transformErrorResponse: (error: AxiosBaseQueryError) => {
        console.error("remove failed:", error);
        return error;
      },
      invalidatesTags: [tag],
    }),
  };
}
