import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders the status label", () => {
    render(<StatusBadge status="COMPLETED" />);
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
  });

  it("applies the colour class for the status", () => {
    render(<StatusBadge status="MISSING" />);
    expect(screen.getByText("MISSING").className).toContain("text-[#99154B]");
  });
});
