import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely (dedupe + conditional). */
export function classNames(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an ISO date string to a readable label, e.g. "21 Jan 2025". */
export function formatDate(iso: string) {
  const parsedDate = new Date(iso);
  if (Number.isNaN(parsedDate.getTime())) return iso;
  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Given a week-start ISO date, format the Mon–Fri range, e.g.
 * "1 - 5 January, 2024" or "28 January - 1 February, 2024".
 */
export function formatWeekRange(iso: string) {
  const start = new Date(iso);
  if (Number.isNaN(start.getTime())) return iso;
  const end = new Date(start);
  end.setDate(start.getDate() + 4);

  const day = (dateValue: Date) => dateValue.getDate();
  const month = (dateValue: Date) =>
    dateValue.toLocaleDateString("en-GB", { month: "long" });
  const year = end.getFullYear();

  return start.getMonth() === end.getMonth()
    ? `${day(start)} - ${day(end)} ${month(end)}, ${year}`
    : `${day(start)} ${month(start)} - ${day(end)} ${month(end)}, ${year}`;
}
