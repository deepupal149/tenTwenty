import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteTimesheet, updateTimesheet } from "@/lib/mock-data";
import { timesheetSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

// PUT /api/timesheets/:id — update an entry
export async function PUT(request: Request, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: timesheetId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = timesheetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const updated = updateTimesheet(timesheetId, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

// DELETE /api/timesheets/:id — remove an entry
export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: timesheetId } = await params;
  const wasDeleted = deleteTimesheet(timesheetId);
  if (!wasDeleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
