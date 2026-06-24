import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  deleteTask,
  getTask,
  updateTask,
  weekStartOf,
  weekTotalHours,
} from "@/lib/mock-data";
import { taskSchema } from "@/lib/validation";
import { WEEKLY_TARGET_HOURS } from "@/lib/constants";

type Params = { params: Promise<{ id: string }> };

// PUT /api/tasks/:id — update a task (re-checks the 40h weekly cap)
export async function PUT(request: Request, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: taskId } = await params;
  const existing = getTask(taskId);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // Sum the rest of the week (excluding this task) + the proposed hours.
  const weekStart = weekStartOf(existing.date);
  const usedHours = weekTotalHours(weekStart, taskId);
  if (usedHours + parsed.data.hours > WEEKLY_TARGET_HOURS) {
    return NextResponse.json(
      {
        error: `This change exceeds the ${WEEKLY_TARGET_HOURS}h weekly limit (${usedHours}/${WEEKLY_TARGET_HOURS} used by other tasks).`,
      },
      { status: 400 },
    );
  }

  const updated = updateTask(taskId, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

// DELETE /api/tasks/:id — remove a task
export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: taskId } = await params;
  const wasDeleted = deleteTask(taskId);
  if (!wasDeleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
