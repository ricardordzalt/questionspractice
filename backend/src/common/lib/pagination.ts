export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 50;

export function parseLimit(limit?: number): number {
  if (!limit || Number.isNaN(limit)) {
    return DEFAULT_LIMIT;
  }

  return Math.max(1, Math.min(limit, MAX_LIMIT));
}

export function parseCursor(cursor?: string): { id: string } | undefined {
  if (!cursor) {
    return undefined;
  }

  return { id: cursor };
}
