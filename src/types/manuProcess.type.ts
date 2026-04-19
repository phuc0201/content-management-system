export interface ManuProcessStep extends Record<string, unknown> {
  id?: string;
  title: string;
  content: string;
  imageId: string | null;
}

export interface ManuProcess extends Record<string, unknown> {
  title: string;
  intro: string;
  steps?: ManuProcessStep[];
}

export type CreateManuProcessDTO = ManuProcess;
export type UpdateManuProcessDTO = Partial<CreateManuProcessDTO>;
