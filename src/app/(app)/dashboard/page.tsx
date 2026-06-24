import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { auth } from "@/lib/auth";
import { listTimesheets } from "@/lib/mock-data";
import { getServerQueryClient } from "@/lib/get-query-client";
import { DEFAULT_LIST_PARAMS, timesheetsKey } from "@/lib/query-keys";
import { TimesheetDashboard } from "@/components/timesheets/TimesheetDashboard";

export default async function DashboardPage() {
  // Server-side guard (middleware also covers this; belt-and-braces).
  const session = await auth();
  if (!session) redirect("/login");

  // Prefetch the first page on the server (direct data-layer call, no HTTP)
  // and dehydrate it. The client mounts with this in cache → no fetch on load.
  const queryClient = getServerQueryClient();
  await queryClient.prefetchQuery({
    queryKey: timesheetsKey(DEFAULT_LIST_PARAMS),
    queryFn: () => listTimesheets(DEFAULT_LIST_PARAMS),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TimesheetDashboard />
    </HydrationBoundary>
  );
}
