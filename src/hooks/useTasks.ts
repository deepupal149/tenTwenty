"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { tasksApi } from "@/lib/api";
import { tasksKey } from "@/lib/query-keys";
import type { TaskEntryInput } from "@/lib/types";

/** Read: task entries for a given timesheet week (by id). Prefetched + hydrated
 *  server-side, so the first paint has data with no client fetch. */
export function useTasks(weekId: string) {
  return useQuery({
    queryKey: tasksKey(weekId),
    queryFn: () => tasksApi.list(weekId),
  });
}

/** Write: create / update / delete tasks, invalidating the week's list. */
export function useTaskMutations(weekId: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: tasksKey(weekId) });

  const create = useMutation({
    mutationFn: (input: TaskEntryInput) => tasksApi.create(weekId, input),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({
      id: taskId,
      input,
    }: {
      id: string;
      input: TaskEntryInput;
    }) => tasksApi.update(taskId, input),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (taskId: string) => tasksApi.remove(taskId),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
