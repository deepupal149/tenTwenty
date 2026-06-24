import { z } from "zod";

/** Login form schema — shared by the form and the next-auth authorize callback. */
export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

export type LoginValues = z.infer<typeof loginSchema>;

/** Timesheet create/edit form schema. */
export const timesheetSchema = z.object({
  // `valueAsNumber` on the inputs gives us real numbers; NaN means "left blank".
  week: z
    .number({ message: "Week is required" })
    .int("Week must be a whole number")
    .min(1, "Week must be between 1 and 53")
    .max(53, "Week must be between 1 and 53"),
  date: z.string().min(1, "Date is required"),
  project: z
    .string()
    .min(2, "Project must be at least 2 characters")
    .max(80, "Project is too long"),
  hours: z
    .number({ message: "Hours is required" })
    .min(0.5, "Minimum 0.5 hours")
    .max(168, "Cannot exceed 168 hours in a week"),
  status: z.enum(["pending", "approved", "rejected"]),
});

export type TimesheetValues = z.infer<typeof timesheetSchema>;

/** Task entry (Screen 3) create/edit schema. All fields required per the spec. */
export const taskSchema = z.object({
  date: z.string().min(1, "Date is required"),
  project: z.string().min(1, "Select a project"),
  typeOfWork: z.string().min(1, "Select a type of work"),
  description: z
    .string()
    .min(1, "Task description is required")
    .max(500, "Description is too long"),
  // Stepper gives whole hours; a full day caps at 24.
  hours: z
    .number({ message: "Hours is required" })
    .int("Hours must be a whole number")
    .min(1, "Minimum 1 hour")
    .max(24, "Cannot exceed 24 hours in a day"),
});

export type TaskValues = z.infer<typeof taskSchema>;
