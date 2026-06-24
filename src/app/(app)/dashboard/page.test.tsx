import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock the auth guard, the navigation redirect, the data layer and the client
// child so we exercise the server component's own logic (guard + prefetch)
// without a real session, DB or QueryClientProvider.
const auth = vi.fn();
// Next's redirect throws to halt the render — mirror that so the guard short-
// circuits exactly as in production.
const redirect = vi.fn(() => {
  throw new Error("NEXT_REDIRECT");
});
const listTimesheets = vi.fn(() => ({ rows: [], total: 0 }));
const prefetchQuery = vi.fn();

vi.mock("@/lib/auth", () => ({ auth: () => auth() }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => redirect(url) }));
vi.mock("@/lib/mock-data", () => ({ listTimesheets: () => listTimesheets() }));
vi.mock("@/lib/get-query-client", () => ({
  getServerQueryClient: () => ({ prefetchQuery: (opts: unknown) => prefetchQuery(opts) }),
}));
vi.mock("@tanstack/react-query", () => ({
  HydrationBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  dehydrate: () => ({}),
}));
vi.mock("@/components/timesheets/TimesheetDashboard", () => ({
  TimesheetDashboard: () => <div data-testid="dashboard" />,
}));

import DashboardPage from "./page";

describe("DashboardPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("redirects to /login when there is no session", async () => {
    auth.mockResolvedValue(null);
    await expect(DashboardPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("prefetches the first page and renders the dashboard when authed", async () => {
    auth.mockResolvedValue({ user: { email: "demo@example.com" } });

    const ui = await DashboardPage();
    render(ui);

    expect(redirect).not.toHaveBeenCalled();
    expect(prefetchQuery).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("dashboard")).toBeInTheDocument();
  });

  it("prefetches with the timesheets key and default list params", async () => {
    auth.mockResolvedValue({ user: { email: "demo@example.com" } });
    await DashboardPage();

    const opts = prefetchQuery.mock.calls[0][0] as { queryKey: unknown[] };
    expect(opts.queryKey).toEqual(["timesheets", { page: 1, perPage: 5 }]);
  });
});
