import type { ApiResponse } from "../types/apiResponse";

export const unwrapItem = <T>(response: ApiResponse<T>) => response.data as T;

export const unwrapList = <T>(response: ApiResponse<T[]>) => response.data ?? [];

export const unwrapOr = <T>(fallback: T) => (response: ApiResponse<T>) => response.data ?? fallback;
