export interface CoreValueItem {
  title: string;
  index: number;
}

export interface AboutContent extends Record<string, unknown> {
  intro: string;
  vision: string;
  mission: string;
  coreValue: CoreValueItem[];
}

export interface AboutItem extends AboutContent {
  id: string;
}

export type CreateAboutDTO = AboutContent;
export type UpdateAboutDTO = Partial<CreateAboutDTO>;
