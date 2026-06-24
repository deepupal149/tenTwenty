import { describe, it, expect } from "vitest";
import { loginSchema, timesheetSchema } from "./validation";

describe("loginSchema", () => {
  it("accepts a valid email + password", () => {
    const result = loginSchema.safeParse({
      email: "demo@tentwenty.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "nope",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a short password", () => {
    const result = loginSchema.safeParse({
      email: "a@b.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });
});

describe("timesheetSchema", () => {
  const valid = {
    week: 25,
    date: "2025-06-16",
    project: "Acme Dashboard",
    hours: 38,
    status: "pending" as const,
  };

  it("accepts a valid entry", () => {
    expect(timesheetSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects week out of range", () => {
    expect(timesheetSchema.safeParse({ ...valid, week: 60 }).success).toBe(false);
  });

  it("rejects hours over 168", () => {
    expect(timesheetSchema.safeParse({ ...valid, hours: 200 }).success).toBe(false);
  });

  it("rejects an unknown status", () => {
    expect(timesheetSchema.safeParse({ ...valid, status: "draft" }).success).toBe(
      false,
    );
  });

  it("rejects an empty project", () => {
    expect(timesheetSchema.safeParse({ ...valid, project: "" }).success).toBe(false);
  });
});
