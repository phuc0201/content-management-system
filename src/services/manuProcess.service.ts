import type { ApiResponse } from "../types/apiResponse";
import type {
  CreateManuProcessDTO,
  ManuProcess,
  UpdateManuProcessDTO,
} from "../types/manuProcess.type";
import type { AxiosBaseQueryError } from "./axiosInstance/axiosBaseQuery";
import { createBaseApiFactory } from "./axiosInstance/baseFactory";

export const manuProcessService = createBaseApiFactory<
  ManuProcess,
  CreateManuProcessDTO,
  UpdateManuProcessDTO
>({
  resource: "/site-configs/manu-process",
  tag: "ManuProcess",
  baseUrl: "admin",
});

const manuProcessExtraApi = manuProcessService.injectEndpoints({
  overrideExisting: "throw",
  endpoints: (builder) => ({
    getManuProcess: builder.query<ManuProcess | null, void>({
      query: () => ({
        url: "/site-configs/manu",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<ManuProcess>) => response?.data || null,
      transformErrorResponse: (error: AxiosBaseQueryError) => {
        console.error("getManuProcess failed:", error);
        return error;
      },
    }),

    createManuProcessUpsert: builder.mutation<ManuProcess, CreateManuProcessDTO>({
      query: (data) => ({
        url: "/site-configs/manu/upsert",
        method: "POST",
        data,
      }),
      transformResponse: (response: ApiResponse<ManuProcess>) => response?.data as ManuProcess,
      transformErrorResponse: (error: AxiosBaseQueryError) => {
        console.error("createManuProcessUpsert failed:", error);
        return error;
      },
    }),
  }),
});

export const { useGetManuProcessQuery, useCreateManuProcessUpsertMutation } = manuProcessExtraApi;
