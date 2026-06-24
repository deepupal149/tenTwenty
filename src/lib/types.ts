export type TimesheetStatus = "pending" | "approved" | "rejected";

export interface Timesheet {
  id: string;
  /** ISO week number, e.g. 25 */
  week: number;
  /** ISO date string (yyyy-mm-dd) — the week start date */
  date: string;
  /** Short description of the logged work */
  project: string;
  /** Hours logged for the entry */
  hours: number;
  status: TimesheetStatus;
}

/** Payload accepted by create/update endpoints (server assigns id). */
export type TimesheetInput = Omit<Timesheet, "id">;

/** Dashboard week status, derived from logged hours (never stored). */
export type WeekStatus = "MISSING" | "INCOMPLETE" | "COMPLETED";

/**
 * A dashboard row: one work week with its status + hours derived live from
 * the task entries that fall in that week.
 *   0h → MISSING · <40h → INCOMPLETE · 40h → COMPLETED
 */
export interface TimesheetWeek {
  id: string;
  week: number;
  /** ISO week-start date (Monday). */
  date: string;
  totalHours: number;
  status: WeekStatus;
}

/** Sortable dashboard columns. */
export type TimesheetSortBy = "week" | "date" | "status";
export type SortDir = "asc" | "desc";

/** Query params for the paginated/filtered dashboard list. */
export interface TimesheetListParams {
  page?: number;
  perPage?: number;
  status?: WeekStatus;
  /** yyyy-mm-dd inclusive range bounds. */
  from?: string;
  to?: string;
  /** Sort column + direction. Defaults to date, newest first. */
  sortBy?: TimesheetSortBy;
  sortDir?: SortDir;
}

/** A page of dashboard rows plus the unpaginated total for the current filter. */
export interface PaginatedTimesheets {
  rows: TimesheetWeek[];
  total: number;
}

/**
 * A single task logged against a specific day (Screen 2 / Screen 3).
 * Tasks roll up into a work week; the week's status is derived from the
 * sum of its task hours vs the 40h target — never stored on the task.
 */
export interface TaskEntry {
  id: string;
  /** ISO date (yyyy-mm-dd) — the specific day the task belongs to. */
  date: string;
  /** Project name (from the Select Project dropdown). */
  project: string;
  /** Category, e.g. "Bug fixes", "Development", "Design". */
  typeOfWork: string;
  /** Free-text task description. */
  description: string;
  /** Whole hours logged (stepper input). */
  hours: number;
}

/** Payload accepted by the task create/update endpoints (server assigns id). */
export type TaskEntryInput = Omit<TaskEntry, "id">;
