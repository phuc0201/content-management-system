import type { QueryPagination, QueryParameter } from "../types/queryParameter";

type Primitive = string | number | boolean | null | undefined | Date;
type DotQuery = Record<string, Primitive>;

const getPaginationParams = ({
  current = 1,
  pageSize = 10,
}: QueryPagination): { offset: number; limit: number } => {
  return {
    offset: Math.max(0, (current - 1) * pageSize),
    limit: Math.max(1, pageSize),
  };
};

export function objectToDotQuery<T extends Record<string, any>>(obj: T): DotQuery {
  const result: DotQuery = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value !== "object" || value === null || value instanceof Date) {
      result[key] = value as Primitive;
    } else if (Array.isArray(value)) {
      result[key] = value as any;
    } else {
      const nested = objectToDotQuery(value);
      for (const [nestedKey, nestedValue] of Object.entries(nested)) {
        result[`${key}.${nestedKey}`] = nestedValue;
      }
    }
  }

  return result;
}

export function buildParams<T extends Record<string, unknown>>(
  query: QueryParameter<T>,
): Record<string, Primitive> {
  const { keyword, search, order, filters, pagination } = query;

  const { offset, limit } = getPaginationParams(pagination ?? { current: 1, pageSize: 10 });

  const params: Record<string, Primitive> = {
    offset,
    limit,
  };

  if (keyword) params.keyword = keyword;
  if (search) params.search = search;
  if (order) params.order = order;

  if (filters) {
    Object.assign(params, objectToDotQuery(filters));
  }

  return params;
}
