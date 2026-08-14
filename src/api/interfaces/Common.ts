/**
 * Every endpoint wraps its payload in this envelope. Keeping a single response
 * shape across the API makes services, hooks, and error handling uniform.
 */
export interface StandardResponse<T> {
  result: string;
  message: string;
  data: T;
}

/** Standard paginated collection returned by list endpoints. */
export interface Paginated<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: T[];
}

export interface GenericDeleteResponse {
  acknowledged: boolean;
  deletedCount: number;
}

/** Shared query params for list endpoints (search + pagination). */
export interface ListParams {
  keyword?: string;
  page?: number;
  limit?: number;
}
