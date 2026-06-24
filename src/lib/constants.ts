/**
 * Demo credentials for the dummy authentication flow.
 * In a real app these would never live in source — they exist only so the
 * reviewer can log in without a backend. Documented in the README.
 */
export const DEMO_USER = {
  id: "1",
  name: "Demo User",
  email: "demo@tentwenty.com",
  password: "password123",
} as const;

/** Full work week target. 40h = COMPLETED. */
export const WEEKLY_TARGET_HOURS = 40;

/** Selectable projects for the Add New Entry modal (Screen 3). */
export const PROJECTS = [
  "Project Name",
  "Acme Dashboard",
  "Mobile App",
  "Internal Tools",
] as const;

/** "Type of Work" options for the Add New Entry modal (Screen 3). */
export const WORK_TYPES = [
  "Bug fixes",
  "Development",
  "Design",
  "Research",
  "Meeting",
] as const;
