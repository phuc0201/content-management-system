import { API_TAG } from "../constants/apiTag.constant";
import type {
    CreateManuProcessDTO,
    ManuProcess,
    ManuProcessItem,
    ManuProcessStep,
    UpdateManuProcessDTO,
} from "../types/manuProcess.type";
import { baseApi, BaseFactory } from "./base.service";
import { unwrapItem, unwrapOr } from "./responseAdapter";

const emptyManuProcess: ManuProcess = {
    title: "",
    intro: "",
    process: [],
};

class ManuProcessFactory extends BaseFactory<ManuProcessItem, CreateManuProcessDTO, UpdateManuProcessDTO> {
    constructor() {
        super("/admin/manu-process", API_TAG.MANU_PROCESS);
    }
}

const factory = new ManuProcessFactory();

export const manuProcessApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        ...factory.build(builder),
        getManuProcess: builder.query<ManuProcess, void>({
            query: () => ({ url: "/manu-process", method: "GET" }),
            transformResponse: unwrapOr(emptyManuProcess),
            providesTags: [API_TAG.MANU_PROCESS],
        }),

        uploadAdminManuProcessStepImage: builder.mutation<ManuProcessStep, { index: number; file: File }>({
            query: ({ index, file }) => {
                const formData = new FormData();
                formData.append("file", file);

                return {
                    url: `/admin/manu-process/${index}`,
                    method: "PATCH",
                    data: formData,
                };
            },
            transformResponse: unwrapItem,
            invalidatesTags: [API_TAG.MANU_PROCESS],
        }),
    }),
});

export const {
    useGetManuProcessQuery,
    useGetListQuery: useGetAdminManuProcessQuery,
    useGetByIdQuery: useGetAdminManuProcessByIdQuery,
    useCreateMutation: useCreateAdminManuProcessMutation,
    useUpdateMutation: useUpdateAdminManuProcessMutation,
    useRemoveMutation: useDeleteAdminManuProcessMutation,
    useUploadAdminManuProcessStepImageMutation,
} = manuProcessApi;
