import { API_TAG } from "../constants/apiTag.constant";
import type { CreatePolicyDTO, Policy, UpdatePolicyDTO } from "../types/policy.type";
import { baseApi, BaseFactory } from "./base.service";

class PolicyFactory extends BaseFactory<Policy, CreatePolicyDTO, UpdatePolicyDTO> {
    constructor() {
        super("/admin/policies", API_TAG.POLICIES);
    }
}

class PublicPolicyFactory extends BaseFactory<Policy, CreatePolicyDTO, UpdatePolicyDTO> {
    constructor() {
        super("/policies", API_TAG.POLICIES);
    }
}

const factory = new PolicyFactory();
const publicFactory = new PublicPolicyFactory();

export const policyApi = baseApi.injectEndpoints({
    endpoints: (builder) => {
        const publicEndpoints = publicFactory.build(builder);

        return {
            ...factory.build(builder),
            getPolicies: publicEndpoints.getList,
            getPolicyById: publicEndpoints.getById,
        };
    },
});

export const {
    useGetPoliciesQuery,
    useGetPolicyByIdQuery,
    useGetListQuery: useGetAdminPoliciesQuery,
    useCreateMutation: useCreateAdminPolicyMutation,
    useUpdateMutation: useUpdateAdminPolicyMutation,
    useRemoveMutation: useDeleteAdminPolicyMutation,
} = policyApi;
