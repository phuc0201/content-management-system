import type { ApiResponse } from "../types/apiResponse";
import type {
  CreateManuProcessDTO,
  ManuProcess,
  ManuProcessStep,
  UpdateManuProcessDTO,
} from "../types/manuProcess.type";
import type { AxiosBaseQueryError } from "./axiosInstance/axiosBaseQuery";
import { createBaseApiFactory } from "./axiosInstance/baseFactory";

export const manuProcessService = createBaseApiFactory<
  ManuProcess,
  CreateManuProcessDTO,
  UpdateManuProcessDTO
>({
  resource: "/site-configs",
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
      transformResponse: (response: ApiResponse<ManuProcess>) => {
        const data = response?.data;
        if (!data) return null;

        return {
          ...data,
          steps: [...(data.steps || [])].sort((a, b) => (a?.index || 0) - (b?.index || 0)),
        };
      },
      transformErrorResponse: (error: AxiosBaseQueryError) => {
        console.error("getManuProcess failed:", error);
        return error;
      },
      providesTags: ["ManuProcess"],
    }),

    upsertManuProcess: builder.mutation<ManuProcess, CreateManuProcessDTO>({
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
      invalidatesTags: ["ManuProcess"],
    }),

    createManuStep: builder.mutation<any, ManuProcessStep>({
      query: (body) => ({
        url: "/site-configs/manu-step",
        method: "POST",
        data: body,
      }),
      transformErrorResponse: (response: AxiosBaseQueryError) => {
        console.error("createManuStep failed:", response);
        return response;
      },
    }),

    updateManuStep: builder.mutation<ApiResponse<ManuProcessStep>, ManuProcessStep>({
      query: ({ id, ...body }) => ({
        url: `/site-configs/manu-step/${id}`,
        method: "PUT",
        data: body,
      }),
      transformErrorResponse: (response: AxiosBaseQueryError) => {
        console.error("updateManuStep failed:", response);
        return response;
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedStep } = await queryFulfilled;

          dispatch(
            (manuProcessService.util.updateQueryData as any)(
              "getManuProcess",
              undefined,
              (draft: ManuProcess | null) => {
                if (!draft) return;
                const stepIndex = draft.steps.findIndex(
                  (step: ManuProcessStep) => step.id === updatedStep?.data?.id,
                );
                if (stepIndex !== -1) {
                  draft.steps[stepIndex].title =
                    updatedStep?.data?.title ?? draft.steps[stepIndex].title;
                  draft.steps[stepIndex].content =
                    updatedStep?.data?.content ?? draft.steps[stepIndex].content;
                  draft.steps[stepIndex].index =
                    updatedStep?.data?.index ?? draft.steps[stepIndex].index;
                }

                draft.steps.sort((a, b) => (a?.index || 0) - (b?.index || 0));
              },
            ),
          );
        } catch (error) {
          console.error("Error in onQueryStarted for updateManuStep:", error);
        }
      },
    }),
  }),
});

export const {
  useGetManuProcessQuery,
  useUpsertManuProcessMutation,
  useCreateManuStepMutation,
  useUpdateManuStepMutation,
  useRemoveMutation: useDeleteManuStepMutation,
} = manuProcessExtraApi;
