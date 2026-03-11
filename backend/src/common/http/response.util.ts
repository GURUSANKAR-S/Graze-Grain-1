export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type SuccessResponse<T> = {
  success: true;
  data: T;
  meta?: PaginationMeta;
};

export function successResponse<T>(
  data: T,
  meta?: PaginationMeta,
): SuccessResponse<T> {
  return meta ? { success: true, data, meta } : { success: true, data };
}
