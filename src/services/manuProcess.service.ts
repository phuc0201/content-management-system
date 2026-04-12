import type {
  CreateManuProcessDTO,
  ManuProcess,
  UpdateManuProcessDTO,
} from "../types/manuProcess.type";
import { createBaseApiFactory } from "./axiosInstance/baseFactory";

export const manuProcessService = createBaseApiFactory<
  ManuProcess,
  CreateManuProcessDTO,
  UpdateManuProcessDTO
>({
  resource: "/manu-process",
  tag: "ManuProcess",
  baseUrl: "admin",
});

export const {
  useGetListQuery: useGetManuProcessQuery,
  useCreateMutation: useCreateManuProcessMutation,
  useUpdateMutation: useUpdateManuProcessMutation,
  useRemoveMutation: useRemoveManuProcessMutation,
} = manuProcessService;
