export interface QueryPagination {
  current: number;
  pageSize: number;
}

export interface QueryParameter<T> {
  keyword?: string;
  search?: string | null;
  order?: string;
  pagination?: QueryPagination;
  filters?: T;
}
