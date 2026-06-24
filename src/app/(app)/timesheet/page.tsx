import { redirect } from "next/navigation";

// A bare /timesheet has no week selected — weekly views are reached by id
// from the dashboard (/timesheet/[id]).
export default function TimesheetIndexPage() {
  redirect("/dashboard");
}
