import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { auth } from "@/lib/auth";
import { getTimesheet, listTasksForWeek } from "@/lib/mock-data";
import { getServerQueryClient } from "@/lib/get-query-client";
import { tasksKey } from "@/lib/query-keys";
import { WeeklyTimesheet } from "@/components/timesheets/WeeklyTimesheet";

type Params = { params: Promise<{ id: string }> };

export default async function TimesheetWeekPage({ params }: Params) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id: timesheetId } = await params;
  const week = getTimesheet(timesheetId);
  if (!week) redirect("/dashboard");

  // Prefetch this week's tasks server-side and hydrate → no client fetch on
  // load. Adding/editing a task still mutates + refetches on the client.
  const queryClient = getServerQueryClient();
  await queryClient.prefetchQuery({
    queryKey: tasksKey(week.id),
    queryFn: () => listTasksForWeek(week.date),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WeeklyTimesheet weekId={week.id} weekStart={week.date} />
    </HydrationBoundary>
  );
}
