export type ApiSuccessResponse<T> = {
  data: T;
  meta: null | {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
  error: null;
};

export type ApiErrorResponse = {
  data: null;
  meta: null;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
};

export function ok<T>(data: T): ApiSuccessResponse<T> {
  return {
    data,
    meta: null,
    error: null,
  };
}

export function okList<T>(
  data: T[],
  meta: { nextCursor: string | null; hasNextPage: boolean },
): ApiSuccessResponse<T[]> {
  return {
    data,
    meta,
    error: null,
  };
}
