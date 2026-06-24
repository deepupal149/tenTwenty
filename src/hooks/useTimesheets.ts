"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { timesheetsApi } from "@/lib/api";
import { timesheetsKey } from "@/lib/query-keys";
import type { TimesheetInput, TimesheetListParams } from "@/lib/types";

const KEY = ["timesheets"] as const;

/**
 * Read: a filtered + paginated page of timesheet rows. The query key includes
 * the params so each page/filter is cached separately; keepPreviousData keeps
 * the old page on screen while the next one loads (no flash to empty).
 *
 * The first page is prefetched server-side and hydrated, so on initial load
 * this resolves from cache with no client fetch. Pagination/filter changes
 * produce a new key and DO fetch on the client.
 */
export function useTimesheets(params: TimesheetListParams = {}) {
  return useQuery({
    queryKey: timesheetsKey(params),
    queryFn: () => timesheetsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/** Write: create / update / delete, each invalidating the list on success. */
export function useTimesheetMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: KEY });

  const create = useMutation({
    mutationFn: (input: TimesheetInput) => timesheetsApi.create(input),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({
      id: timesheetId,
      input,
    }: {
      id: string;
      input: TimesheetInput;
    }) => timesheetsApi.update(timesheetId, input),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (timesheetId: string) => timesheetsApi.remove(timesheetId),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
