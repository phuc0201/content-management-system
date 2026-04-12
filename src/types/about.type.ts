export interface CoreValueItem {
  title: string;
}

export interface AboutContent extends Record<string, unknown> {
  intro: string;
  vision: string;
  mission: string;
  core_values: string[];
}

export interface AboutItem extends AboutContent {
  id: string;
}

export type CreateAboutDTO = AboutContent;
export type UpdateAboutDTO = Partial<CreateAboutDTO>;
