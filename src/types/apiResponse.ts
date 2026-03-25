export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code?: number;
    message?: string;
  };
  meta: {
    pageSize?: number;
    totalItems?: number;
    totalPages?: number;
    timestamp?: string;
    path?: string;
  };
}
