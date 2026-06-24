import type {
  Timesheet,
  TimesheetInput,
  TimesheetListParams,
  PaginatedTimesheets,
  TaskEntry,
  TaskEntryInput,
} from "./types";

/**
 * Thin client-side wrappers around the internal /api routes.
 * Centralising fetch here keeps components free of URL/error boilerplate.
 */

async function handleResponse<ResponseBody>(
  response: Response,
): Promise<ResponseBody> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody?.error ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<ResponseBody>;
}

export const timesheetsApi = {
  list: (params: TimesheetListParams = {}): Promise<PaginatedTimesheets> => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.perPage) searchParams.set("perPage", String(params.perPage));
    if (params.status) searchParams.set("status", params.status);
    if (params.from) searchParams.set("from", params.from);
    if (params.to) searchParams.set("to", params.to);
    if (params.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params.sortDir) searchParams.set("sortDir", params.sortDir);
    const queryString = searchParams.toString();
    return fetch(
      `/api/timesheets${queryString ? `?${queryString}` : ""}`,
    ).then((response) => handleResponse<PaginatedTimesheets>(response));
  },

  create: (input: TimesheetInput): Promise<Timesheet> =>
    fetch("/api/timesheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then((response) => handleResponse<Timesheet>(response)),

  update: (timesheetId: string, input: TimesheetInput): Promise<Timesheet> =>
    fetch(`/api/timesheets/${timesheetId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then((response) => handleResponse<Timesheet>(response)),

  remove: (timesheetId: string): Promise<{ success: boolean }> =>
    fetch(`/api/timesheets/${timesheetId}`, { method: "DELETE" }).then(
      (response) => handleResponse<{ success: boolean }>(response),
    ),
};

export const tasksApi = {
  // List/create are scoped to a timesheet week by its id.
  list: (weekId: string): Promise<TaskEntry[]> =>
    fetch(`/api/timesheets/${weekId}/tasks`).then((response) =>
      handleResponse<TaskEntry[]>(response),
    ),

  create: (weekId: string, input: TaskEntryInput): Promise<TaskEntry> =>
    fetch(`/api/timesheets/${weekId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then((response) => handleResponse<TaskEntry>(response)),

  // Edit/delete act on a single task by its id.
  update: (taskId: string, input: TaskEntryInput): Promise<TaskEntry> =>
    fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then((response) => handleResponse<TaskEntry>(response)),

  remove: (taskId: string): Promise<{ success: boolean }> =>
    fetch(`/api/tasks/${taskId}`, { method: "DELETE" }).then((response) =>
      handleResponse<{ success: boolean }>(response),
    ),
};
