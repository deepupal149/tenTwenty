import type {
  Timesheet,
  TimesheetInput,
  TimesheetWeek,
  TimesheetListParams,
  PaginatedTimesheets,
  WeekStatus,
  TaskEntry,
  TaskEntryInput,
} from "./types";
import { WEEKLY_TARGET_HOURS } from "./constants";

/**
 * In-memory mock store standing in for a real database/API.
 *
 * We attach it to `globalThis` so the data survives Next.js dev hot-reloads
 * (each route module reload would otherwise reset a plain module-level array).
 * This is intentionally simple — no real backend is provided for the exercise.
 */
const seed = (): Timesheet[] => [
  { id: "1", week: 21, date: "2025-05-19", project: "Acme Dashboard", hours: 38, status: "approved" },
  { id: "2", week: 22, date: "2025-05-26", project: "Acme Dashboard", hours: 40, status: "approved" },
  { id: "3", week: 23, date: "2025-06-02", project: "Mobile App", hours: 32, status: "pending" },
  { id: "4", week: 24, date: "2025-06-09", project: "Mobile App", hours: 41, status: "rejected" },
  { id: "5", week: 25, date: "2025-06-16", project: "Internal Tools", hours: 36, status: "pending" },
  { id: "6", week: 20, date: "2025-05-12", project: "Acme Dashboard", hours: 0, status: "pending" },
  { id: "7", week: 19, date: "2025-05-05", project: "Acme Dashboard", hours: 0, status: "pending" },
  { id: "8", week: 18, date: "2025-04-28", project: "Mobile App", hours: 0, status: "pending" },
  { id: "9", week: 17, date: "2025-04-21", project: "Mobile App", hours: 0, status: "pending" },
  { id: "10", week: 16, date: "2025-04-14", project: "Internal Tools", hours: 0, status: "pending" },
  { id: "11", week: 15, date: "2025-04-07", project: "Internal Tools", hours: 0, status: "pending" },
  { id: "12", week: 14, date: "2025-03-31", project: "Acme Dashboard", hours: 0, status: "pending" },
  { id: "13", week: 13, date: "2025-03-24", project: "Acme Dashboard", hours: 0, status: "pending" },
  { id: "14", week: 12, date: "2025-03-17", project: "Mobile App", hours: 0, status: "pending" },
  { id: "15", week: 11, date: "2025-03-10", project: "Mobile App", hours: 0, status: "pending" },
  { id: "16", week: 10, date: "2025-03-03", project: "Internal Tools", hours: 0, status: "pending" },
  { id: "17", week: 9, date: "2025-02-24", project: "Internal Tools", hours: 0, status: "pending" },
  { id: "18", week: 8, date: "2025-02-17", project: "Acme Dashboard", hours: 0, status: "pending" },
  { id: "19", week: 7, date: "2025-02-10", project: "Mobile App", hours: 0, status: "pending" },
  { id: "20", week: 6, date: "2025-02-03", project: "Internal Tools", hours: 0, status: "pending" },
];

type Store = { timesheets: Timesheet[]; nextId: number };

const globalForStore = globalThis as unknown as { __timesheetStore?: Store };

const store: Store =
  globalForStore.__timesheetStore ??
  (globalForStore.__timesheetStore = { timesheets: seed(), nextId: 21 });

/** MISSING (0h) · INCOMPLETE (<40h) · COMPLETED (40h). */
/** Progression order used when sorting by status. */
const STATUS_RANK: Record<WeekStatus, number> = {
  MISSING: 0,
  INCOMPLETE: 1,
  COMPLETED: 2,
};

export function deriveStatus(totalHours: number): WeekStatus {
  if (totalHours <= 0) return "MISSING";
  if (totalHours >= WEEKLY_TARGET_HOURS) return "COMPLETED";
  return "INCOMPLETE";
}

/**
 * Dashboard rows, filtered + paginated server-side. Status + hours are derived
 * live from each week's task entries, so they recalculate whenever a task is
 * added/edited/deleted. Returns the requested page plus the total row count for
 * the active filter (so the client can compute the page count).
 */
export function listTimesheets(
  params: TimesheetListParams = {},
): PaginatedTimesheets {
  const {
    page = 1,
    perPage = 5,
    status,
    from,
    to,
    sortBy = "date",
    sortDir = "desc",
  } = params;

  let rows: TimesheetWeek[] = store.timesheets.map(({ id, week, date }) => {
    const totalHours = weekTotalHours(date);
    return { id, week, date, totalHours, status: deriveStatus(totalHours) };
  });

  if (status) rows = rows.filter((row) => row.status === status);
  if (from || to) {
    rows = rows.filter((row) => {
      // A week spans [date .. date+4]; keep it if it overlaps the range.
      const weekEnd = dayOffset(row.date, 4);
      if (from && weekEnd < from) return false;
      if (to && row.date > to) return false;
      return true;
    });
  }

  // Status sorts by progression (Missing → Incomplete → Completed); date sorts
  // chronologically. Date breaks ties so order is always deterministic.
  const sortMultiplier = sortDir === "asc" ? 1 : -1;
  const byDate = (firstRow: TimesheetWeek, secondRow: TimesheetWeek) =>
    firstRow.date < secondRow.date
      ? -1
      : firstRow.date > secondRow.date
        ? 1
        : 0;
  rows.sort((firstRow, secondRow) => {
    let primary: number;
    if (sortBy === "week") {
      primary = firstRow.week - secondRow.week;
    } else if (sortBy === "status") {
      primary =
        STATUS_RANK[firstRow.status] - STATUS_RANK[secondRow.status] ||
        byDate(firstRow, secondRow);
    } else {
      primary = byDate(firstRow, secondRow);
    }
    return primary * sortMultiplier;
  });

  const total = rows.length;
  const start = (page - 1) * perPage;

  return { rows: rows.slice(start, start + perPage), total };
}

export function getTimesheet(id: string): Timesheet | undefined {
  return store.timesheets.find((timesheet) => timesheet.id === id);
}

export function createTimesheet(input: TimesheetInput): Timesheet {
  const entry: Timesheet = { id: String(store.nextId++), ...input };
  store.timesheets.push(entry);
  return entry;
}

export function updateTimesheet(
  id: string,
  input: TimesheetInput,
): Timesheet | undefined {
  const index = store.timesheets.findIndex(
    (timesheet) => timesheet.id === id,
  );
  if (index === -1) return undefined;
  store.timesheets[index] = { id, ...input };
  return store.timesheets[index];
}

export function deleteTimesheet(id: string): boolean {
  const index = store.timesheets.findIndex(
    (timesheet) => timesheet.id === id,
  );
  if (index === -1) return false;
  store.timesheets.splice(index, 1);
  return true;
}

/* ------------------------------------------------------------------ */
/* Task entries (Screen 2 / Screen 3)                                  */
/* ------------------------------------------------------------------ */

/** yyyy-mm-dd for the Nth day after a week-start date. */
function dayOffset(weekStart: string, days: number): string {
  const offsetDate = new Date(weekStart);
  offsetDate.setDate(offsetDate.getDate() + days);
  return offsetDate.toISOString().slice(0, 10);
}

/** Monday (ISO) of the work week a given date falls in. */
export function weekStartOf(iso: string): string {
  const date = new Date(iso);
  const dayOfWeek = date.getDay(); // 0 = Sun … 6 = Sat
  date.setDate(date.getDate() + (dayOfWeek === 0 ? -6 : 1 - dayOfWeek));
  return date.toISOString().slice(0, 10);
}

/**
 * Seeds tasks against real dashboard week start dates so each row opens with
 * meaningful data:
 *  - week of 2025-05-26 (id 2): 40h → COMPLETED, read-only
 *  - week of 2025-06-02 (id 3): 20h → INCOMPLETE, editable
 * Other weeks start empty (MISSING / add-from-scratch).
 */
const seedTasks = (): TaskEntry[] => {
  const makeTask = (
    id: string,
    weekStart: string,
    dayIndex: number,
    hours: number,
    typeOfWork: string,
    description: string,
  ): TaskEntry => ({
    id,
    date: dayOffset(weekStart, dayIndex),
    project: "Project Name",
    typeOfWork,
    description,
    hours,
  });
  return [
    // Completed week — 5 × 8h = 40h
    makeTask("t1", "2025-05-26", 0, 8, "Development", "Homepage Development"),
    makeTask("t2", "2025-05-26", 1, 8, "Development", "API integration"),
    makeTask("t3", "2025-05-26", 2, 8, "Bug fixes", "Fix layout bugs"),
    makeTask("t4", "2025-05-26", 3, 8, "Design", "Design review"),
    makeTask("t5", "2025-05-26", 4, 8, "Development", "Deploy & QA"),
    // Incomplete week — 20h
    makeTask("t6", "2025-06-02", 0, 8, "Development", "Homepage Development"),
    makeTask("t7", "2025-06-02", 1, 4, "Bug fixes", "Fix navbar"),
    makeTask("t8", "2025-06-02", 2, 8, "Development", "Dashboard charts"),
  ];
};

type TaskStore = { tasks: TaskEntry[]; nextId: number };

const globalForTasks = globalThis as unknown as { __taskStore?: TaskStore };

const taskStore: TaskStore =
  globalForTasks.__taskStore ??
  (globalForTasks.__taskStore = (() => {
    const tasks = seedTasks();
    // Derive the next id from the seed so adding tasks never collides.
    const maxId = tasks.reduce(
      (highestId, task) =>
        Math.max(highestId, Number(task.id.replace(/^t/, "")) || 0),
      0,
    );
    return { tasks, nextId: maxId + 1 };
  })());

/** All tasks in the Mon–Fri window starting at `weekStart` (inclusive). */
export function listTasksForWeek(weekStart: string): TaskEntry[] {
  const end = dayOffset(weekStart, 4);
  return taskStore.tasks
    .filter((task) => task.date >= weekStart && task.date <= end)
    .sort((firstTask, secondTask) =>
      firstTask.date.localeCompare(secondTask.date),
    );
}

/** Sum of logged hours for a week, optionally excluding one task (for edits). */
export function weekTotalHours(weekStart: string, excludeId?: string): number {
  return listTasksForWeek(weekStart)
    .filter((task) => task.id !== excludeId)
    .reduce((sum, task) => sum + task.hours, 0);
}

export function getTask(id: string): TaskEntry | undefined {
  return taskStore.tasks.find((task) => task.id === id);
}

export function createTask(input: TaskEntryInput): TaskEntry {
  const entry: TaskEntry = { id: `t${taskStore.nextId++}`, ...input };
  taskStore.tasks.push(entry);
  return entry;
}

export function updateTask(
  id: string,
  input: TaskEntryInput,
): TaskEntry | undefined {
  const index = taskStore.tasks.findIndex((task) => task.id === id);
  if (index === -1) return undefined;
  taskStore.tasks[index] = { id, ...input };
  return taskStore.tasks[index];
}

export function deleteTask(id: string): boolean {
  const index = taskStore.tasks.findIndex((task) => task.id === id);
  if (index === -1) return false;
  taskStore.tasks.splice(index, 1);
  return true;
}
