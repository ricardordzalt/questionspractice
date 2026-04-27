export type ApiError = {
  code: string;
  message: string;
  fields?: Record<string, string[]>;
};

export type ApiEnvelope<T> = {
  data: T;
  meta:
    | null
    | {
        nextCursor: string | null;
        hasNextPage: boolean;
      };
  error: ApiError | null;
};
