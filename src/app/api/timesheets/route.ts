import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createTimesheet, listTimesheets } from "@/lib/mock-data";
import { timesheetSchema } from "@/lib/validation";
import type { WeekStatus, TimesheetSortBy, SortDir } from "@/lib/types";

/**
 * Internal API route. The client never talks to the data source directly —
 * it calls this route, which checks the session before reading/writing.
 */

// GET /api/timesheets — paginated + filtered list
export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const parseNumber = (value: string | null) =>
    value ? Number(value) : undefined;
  const status = searchParams.get("status") as WeekStatus | null;
  const sortBy = searchParams.get("sortBy") as TimesheetSortBy | null;
  const sortDir = searchParams.get("sortDir") as SortDir | null;

  return NextResponse.json(
    listTimesheets({
      page: parseNumber(searchParams.get("page")),
      perPage: parseNumber(searchParams.get("perPage")),
      status: status ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      sortBy: sortBy ?? undefined,
      sortDir: sortDir ?? undefined,
    }),
  );
}

// POST /api/timesheets — create an entry
export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = timesheetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const created = createTimesheet(parsed.data);
  return NextResponse.json(created, { status: 201 });
}
