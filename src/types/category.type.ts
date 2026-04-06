export interface Category extends Record<string, unknown> {
  id: number;
  name: string;
}

export interface CreateCategoryDTO {
  name: string;
}

export type UpdateCategoryDTO = Partial<CreateCategoryDTO>;
