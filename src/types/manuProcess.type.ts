export interface ManuProcessStep extends Record<string, unknown> {
  id?: string;
  title: string;
  content: string;
  images?: ManuStepImage[];
  image?: File | string | null;
}

export interface ManuProcess extends Record<string, unknown> {
  title: string;
  intro: string;
  steps: ManuProcessStep[];
}

export type CreateManuProcessDTO = ManuProcess;
export type UpdateManuProcessDTO = Partial<CreateManuProcessDTO>;

export interface ManuStepImage {
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
