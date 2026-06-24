import type { TimesheetListParams } from "./types";

/**
 * Shared React Query key builders. Both the client hooks and the server-side
 * prefetch use these so the dehydrated cache hydrates onto the exact same key
 * (a mismatch would trigger a redundant client refetch on first paint).
 */

/** Initial dashboard list: page 1, default page size, no filters. */
export const DEFAULT_LIST_PARAMS: TimesheetListParams = { page: 1, perPage: 5 };

export const timesheetsKey = (params: TimesheetListParams) =>
  ["timesheets", params] as const;

export const tasksKey = (weekId: string) => ["tasks", weekId] as const;
