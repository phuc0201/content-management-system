export interface Policy extends Record<string, unknown> {
  id: number;
  title: string;
  content?: string;
  images?: PolicyImage[];
}

export interface CreatePolicyDTO {
  title: string;
  content: string;
}

export type UpdatePolicyDTO = Partial<CreatePolicyDTO>;

export interface PolicyImage {
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
