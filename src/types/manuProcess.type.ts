export interface ManuProcessStep extends Record<string, unknown> {
    id?: number;
    title: string;
    content: string;
    imgUrl: string | null;
    index: number;
}

export interface ManuProcess extends Record<string, unknown> {
    title: string;
    intro: string;
    process: ManuProcessStep[];
}

export interface ManuProcessItem extends ManuProcess {
    id: number;
}

export type CreateManuProcessDTO = ManuProcess;
export type UpdateManuProcessDTO = Partial<CreateManuProcessDTO>;
