export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error?: {
    code?: string;
    message?: string;
  };
  meta: {
    timestamp: string;
    path: string;
    pagination?: {
      page: number;
      totalPages: number;
      pageSize: number;
      totalItems: number;
    };
  };
}
