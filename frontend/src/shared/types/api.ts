export type ApiError = {
  code: string;
  message: string;
  fields?: Record<string, string[]>;
};

export type ApiEnvelope<T> = {
  data: T;
  meta: null;
  error: ApiError | null;
};
