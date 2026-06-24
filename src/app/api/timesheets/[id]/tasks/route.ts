import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createTask,
  getTimesheet,
  listTasksForWeek,
  weekTotalHours,
} from "@/lib/mock-data";
import { taskSchema } from "@/lib/validation";
import { WEEKLY_TARGET_HOURS } from "@/lib/constants";

type Params = { params: Promise<{ id: string }> };

/** Resolve a dashboard timesheet id to its Mon-anchored week start date. */
async function resolveWeek(timesheetId: string) {
  const timesheet = getTimesheet(timesheetId);
  return timesheet ? { timesheet, weekStart: timesheet.date } : null;
}

// GET /api/timesheets/:id/tasks — tasks for that week, date-sorted
export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: timesheetId } = await params;
  const week = await resolveWeek(timesheetId);
  if (!week) {
    return NextResponse.json({ error: "Timesheet not found" }, { status: 404 });
  }
  return NextResponse.json(listTasksForWeek(week.weekStart));
}

// POST /api/timesheets/:id/tasks — add a task, enforcing the 40h weekly cap
export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: timesheetId } = await params;
  const week = await resolveWeek(timesheetId);
  if (!week) {
    return NextResponse.json({ error: "Timesheet not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // The task's day must fall inside this week's Mon–Fri window (max 5 days).
  const weekEndDate = new Date(week.weekStart);
  weekEndDate.setDate(weekEndDate.getDate() + 4);
  const weekEndIso = weekEndDate.toISOString().slice(0, 10);
  if (parsed.data.date < week.weekStart || parsed.data.date > weekEndIso) {
    return NextResponse.json(
      { error: "Task date is outside this week" },
      { status: 400 },
    );
  }

  const usedHours = weekTotalHours(week.weekStart);
  if (usedHours + parsed.data.hours > WEEKLY_TARGET_HOURS) {
    return NextResponse.json(
      {
        error: `Adding ${parsed.data.hours}h exceeds the ${WEEKLY_TARGET_HOURS}h weekly limit (${usedHours}/${WEEKLY_TARGET_HOURS} used).`,
      },
      { status: 400 },
    );
  }

  const created = createTask(parsed.data);
  return NextResponse.json(created, { status: 201 });
}
