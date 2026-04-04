import { createApi } from "@reduxjs/toolkit/query/react";
import { API_TAG } from "../constants/apiTag.constant";
import type { AboutContent, AboutItem, CreateAboutDTO, UpdateAboutDTO } from "../types/about.type";
import { axiosBaseQuery } from "./axiosInstance/axiosBaseQuery";
import { BaseFactory } from "./base.service";
import { unwrapOr } from "./responseAdapter";

const emptyAbout: AboutContent = {
    intro: "",
    vision: "",
    mission: "",
    coreValue: [],
};

class AdminAboutFactory extends BaseFactory<AboutItem, CreateAboutDTO, UpdateAboutDTO> {
    constructor() {
        super("/admin/abouts", API_TAG.ABOUT);
    }
}

const adminFactory = new AdminAboutFactory();

export const aboutApii = createApi({
    reducerPath: "abouts",
    baseQuery: axiosBaseQuery({ baseUrl: "" }),
    tagTypes: [API_TAG.ABOUT],
    endpoints: () => ({}),
});

export const aboutApi = aboutApii.injectEndpoints({
    endpoints: (builder) => ({
        ...adminFactory.build(builder),
        getAbouts: builder.query<AboutContent, void>({
            query: () => ({ url: "/abouts", method: "GET" }),
            transformResponse: unwrapOr(emptyAbout),
            providesTags: [API_TAG.ABOUT],
        }),
    }),
});

export const {
    useGetAboutsQuery,
    useGetListQuery: useGetAdminAboutsQuery,
    useUpdateMutation: useUpdateAdminAboutsMutation,
    useGetByIdQuery: useGetAdminAboutByIdQuery,
    useRemoveMutation: useDeleteAdminAboutMutation,
    useCreateMutation: useCreateAdminAboutsMutation,
} = aboutApi;
