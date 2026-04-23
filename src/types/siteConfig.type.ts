export type SiteConfigItem = {
  id: string;
  type: string;
  text?: string | null;
  title?: string | null;
  content?: string | null;
  link?: string | null;
  active?: boolean;
  index?: number | null;
  images?: SiteConfigImage[];
};

export type UpsertSiteConfigBody = {
  id?: string;
  text?: string;
  title?: string;
  content?: string;
  link?: string;
  index?: number;
};

export interface SiteConfigImage {
  id?: string;
  url?: string;
  filePath?: string;
  scope?: string;
  productId?: number;
  blogId?: number | null;
  policyId?: number | null;
  siteConfigId?: number | null;
  alt?: string | null;
  index?: number;
  active?: boolean;
  deleted?: boolean;
}
