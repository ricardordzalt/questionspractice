export type ApiSuccessResponse<T> = {
  data: T;
  meta: null;
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
