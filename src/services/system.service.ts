import { API_TAG } from "../constants/apiTag.constant";
import type { LatestUpdate } from "../types/system.type";
import { baseApi } from "./base.service";
import { unwrapOr } from "./responseAdapter";

export const systemApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSystemMessage: builder.query<string, void>({
            query: () => ({
                url: "/",
                method: "GET",
            }),
            transformResponse: unwrapOr(""),
            providesTags: [API_TAG.SYSTEM],
        }),

        getLatestUpdate: builder.query<LatestUpdate, void>({
            query: () => ({
                url: "/latest-update",
                method: "GET",
            }),
            transformResponse: unwrapOr({ date: "" }),
            providesTags: [API_TAG.SYSTEM],
        }),

        getLastestUpdate: builder.query<LatestUpdate, void>({
            query: () => ({
                url: "/lastest-update",
                method: "GET",
            }),
            transformResponse: unwrapOr({ date: "" }),
            providesTags: [API_TAG.SYSTEM],
        }),
    }),
});

export const { useGetSystemMessageQuery, useGetLatestUpdateQuery, useGetLastestUpdateQuery } = systemApi;
