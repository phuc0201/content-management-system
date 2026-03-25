export interface Blog extends Record<string, unknown> {}

export interface CreateBlogDTO extends Omit<Blog, "id"> {}

export interface UpdateBlogDTO extends Partial<Blog> {}
