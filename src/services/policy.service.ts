import type { CreatePolicyDTO, Policy, UpdatePolicyDTO } from "../types/policy.type";
import { createBaseApiFactory } from "./axiosInstance/baseFactory";

export const policyService = createBaseApiFactory<Policy, CreatePolicyDTO, UpdatePolicyDTO>({
  baseUrl: "admin",
  resource: "/policies",
  tag: "Policy",
});

export const {
  useGetListQuery: useGetPoliciesQuery,
  useGetByIdQuery: useGetPolicyByIdQuery,
  useCreateMutation: useCreatePolicyMutation,
  useUpdateMutation: useUpdatePolicyMutation,
  useRemoveMutation: useRemovePolicyMutation,
} = policyService;
