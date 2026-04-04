export interface HeroSection {
    title: string;
    content: string;
    imgUrl: string;
}

export interface SiteConfigPublic extends Record<string, unknown> {
    icon: {
        favicon: string;
        mainLogo: string;
        subLogo: string;
    };
    topBar: Array<{
        index: number;
        content: string;
        link?: string;
    }>;
    contact: {
        content: string;
        link: string;
        imgUrl: string;
    };
    contactInfor: {
        name: string;
        address: string;
        taxCode: string;
        phoneNumber: string;
        email: string;
        lng: number;
        lat: number;
    };
    heroSection: {
        home: HeroSection;
        about: HeroSection;
        manuProcess: HeroSection;
    };
    color: {
        primary: string;
        secondary: string;
    };
}

export interface SiteConfigItem extends Record<string, unknown> {
    id: string;
    type: string;
    title: string | null;
    content: string | null;
    text: string | null;
    link: string | null;
    imgUrl: string | null;
    active: boolean;
    index: number;
}

export interface CreateSiteConfigDTO {
    type: string;
    title: string | null;
    content: string | null;
    text: string | null;
    link: string | null;
    imgUrl: string | null;
    active: boolean;
    index: number;
}

export type UpdateSiteConfigDTO = Partial<CreateSiteConfigDTO>;
