import { API_TAG } from "../constants/apiTag.constant";
import type {
    CreateSiteConfigDTO,
    SiteConfigItem,
    SiteConfigPublic,
    UpdateSiteConfigDTO,
} from "../types/siteConfig.type";
import { baseApi, BaseFactory } from "./base.service";
import { unwrapItem, unwrapOr } from "./responseAdapter";

class SiteConfigFactory extends BaseFactory<SiteConfigItem, CreateSiteConfigDTO, UpdateSiteConfigDTO> {
    constructor() {
        super("/admin/site-config", API_TAG.SITE_CONFIG);
    }
}

const factory = new SiteConfigFactory();

const emptySiteConfig: SiteConfigPublic = {
    icon: { favicon: "", mainLogo: "", subLogo: "" },
    topBar: [],
    contact: { content: "", link: "", imgUrl: "" },
    contactInfor: {
        name: "",
        address: "",
        taxCode: "",
        phoneNumber: "",
        email: "",
        lng: 0,
        lat: 0,
    },
    heroSection: {
        home: { title: "", content: "", imgUrl: "" },
        about: { title: "", content: "", imgUrl: "" },
        manuProcess: { title: "", content: "", imgUrl: "" },
    },
    color: { primary: "", secondary: "" },
};

export const siteConfigApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        ...factory.build(builder),
        getConfig: builder.query<SiteConfigPublic, void>({
            query: () => ({ url: "/config", method: "GET" }),
            transformResponse: unwrapOr(emptySiteConfig),
            providesTags: [API_TAG.SITE_CONFIG],
        }),

        getSiteConfig: builder.query<SiteConfigPublic, void>({
            query: () => ({ url: "/site-config", method: "GET" }),
            transformResponse: unwrapOr(emptySiteConfig),
            providesTags: [API_TAG.SITE_CONFIG],
        }),

        uploadAdminSiteConfigImage: builder.mutation<SiteConfigItem, { id: string; file: File }>({
            query: ({ id, file }) => {
                const formData = new FormData();
                formData.append("file", file);

                return {
                    url: `/admin/site-config/${id}/imgs`,
                    method: "PATCH",
                    data: formData,
                };
            },
            transformResponse: unwrapItem,
            invalidatesTags: [API_TAG.SITE_CONFIG],
        }),
    }),
});

export const {
    useGetConfigQuery,
    useGetSiteConfigQuery,
    useGetListQuery: useGetAdminSiteConfigListQuery,
    useGetByIdQuery: useGetAdminSiteConfigByIdQuery,
    useCreateMutation: useCreateAdminSiteConfigMutation,
    useUpdateMutation: useUpdateAdminSiteConfigMutation,
    useRemoveMutation: useDeleteAdminSiteConfigMutation,
    useUploadAdminSiteConfigImageMutation,
} = siteConfigApi;
