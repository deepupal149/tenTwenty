import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Timesheet } from "@/lib/types";

const auth = vi.fn();
// Mirror Next's real redirect: it throws to halt the render. Tests that expect
// a redirect therefore await a rejection, then assert the recorded target.
const redirect = vi.fn((_url: string) => {
  throw new Error("NEXT_REDIRECT");
});
const getTimesheet = vi.fn();
const listTasksForWeek = vi.fn(() => []);
const prefetchQuery = vi.fn();

vi.mock("@/lib/auth", () => ({ auth: () => auth() }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => redirect(url) }));
vi.mock("@/lib/mock-data", () => ({
  getTimesheet: (id: string) => getTimesheet(id),
  listTasksForWeek: () => listTasksForWeek(),
}));
vi.mock("@/lib/get-query-client", () => ({
  getServerQueryClient: () => ({ prefetchQuery: (opts: unknown) => prefetchQuery(opts) }),
}));
vi.mock("@tanstack/react-query", () => ({
  HydrationBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  dehydrate: () => ({}),
}));
vi.mock("@/components/timesheets/WeeklyTimesheet", () => ({
  WeeklyTimesheet: ({ weekId }: { weekId: string }) => (
    <div data-testid="weekly">{weekId}</div>
  ),
}));

import TimesheetWeekPage from "./page";

const week: Timesheet = {
  id: "3",
  week: 23,
  date: "2025-06-02",
  project: "Mobile App",
  hours: 32,
  status: "pending",
};

const propsFor = (id: string) => ({ params: Promise.resolve({ id }) });

describe("TimesheetWeekPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("redirects to /login when there is no session", async () => {
    auth.mockResolvedValue(null);
    await expect(TimesheetWeekPage(propsFor("3"))).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("redirects to /dashboard when the week id is unknown", async () => {
    auth.mockResolvedValue({ user: { email: "demo@example.com" } });
    getTimesheet.mockReturnValue(undefined);

    await expect(TimesheetWeekPage(propsFor("999"))).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("prefetches tasks and renders the weekly view for a valid week", async () => {
    auth.mockResolvedValue({ user: { email: "demo@example.com" } });
    getTimesheet.mockReturnValue(week);

    const ui = await TimesheetWeekPage(propsFor("3"));
    render(ui);

    expect(redirect).not.toHaveBeenCalled();
    expect(prefetchQuery).toHaveBeenCalledTimes(1);
    const opts = prefetchQuery.mock.calls[0][0] as { queryKey: unknown[] };
    expect(opts.queryKey).toEqual(["tasks", "3"]);
    expect(screen.getByTestId("weekly")).toHaveTextContent("3");
  });
});
