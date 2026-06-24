import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimesheetForm } from "./TimesheetForm";
import type { Timesheet } from "@/lib/types";

const noop = () => {};

describe("TimesheetForm", () => {
  it("shows validation errors when required fields are empty", async () => {
    const user = userEvent.setup();
    render(<TimesheetForm onSubmit={vi.fn()} onCancel={noop} />);

    await user.click(screen.getByRole("button", { name: /add entry/i }));

    expect(await screen.findByText("Date is required")).toBeInTheDocument();
    expect(
      screen.getByText("Project must be at least 2 characters"),
    ).toBeInTheDocument();
  });

  it("submits parsed values when the form is valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TimesheetForm onSubmit={onSubmit} onCancel={noop} />);

    await user.type(screen.getByLabelText("Date"), "2025-06-16");
    await user.type(screen.getByLabelText("Project"), "Acme Dashboard");
    await user.click(screen.getByRole("button", { name: /add entry/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      project: "Acme Dashboard",
      date: "2025-06-16",
      hours: 8,
      week: 1,
      status: "pending",
    });
  });

  it("prefills values when editing", () => {
    const entry: Timesheet = {
      id: "9",
      week: 30,
      date: "2025-07-21",
      project: "Mobile App",
      hours: 40,
      status: "approved",
    };
    render(<TimesheetForm initial={entry} onSubmit={vi.fn()} onCancel={noop} />);

    expect(screen.getByLabelText("Project")).toHaveValue("Mobile App");
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });

  it("calls onCancel when cancel is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<TimesheetForm onSubmit={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
