export interface Policy extends Record<string, unknown> {
  id: number;
  title: string;
  content?: string;
}

export interface CreatePolicyDTO {
  title: string;
  content: string;
}

export type UpdatePolicyDTO = Partial<CreatePolicyDTO>;
