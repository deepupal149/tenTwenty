import { describe, it, expect, vi, beforeEach } from "vitest";

const redirect = vi.fn((_url: string) => {
  throw new Error("NEXT_REDIRECT");
});
vi.mock("next/navigation", () => ({ redirect: (url: string) => redirect(url) }));

import TimesheetIndexPage from "./page";

describe("TimesheetIndexPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("redirects to /dashboard (no week selected at bare /timesheet)", () => {
    expect(() => TimesheetIndexPage()).toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });
});
