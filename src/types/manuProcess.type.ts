export interface ManuProcessStep extends Record<string, unknown> {
  id?: number;
  title: string;
  content: string;
  imgId: string | null;
}

export interface ManuProcess extends Record<string, unknown> {
  title: string;
  intro: string;
  steps: ManuProcessStep[];
}

export type CreateManuProcessDTO = ManuProcess;
export type UpdateManuProcessDTO = Partial<CreateManuProcessDTO>;
