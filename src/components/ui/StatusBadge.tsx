import type { WeekStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { classNames } from "@/lib/utils";

/**
 * Status pill for a dashboard week. Status is derived from logged hours:
 * COMPLETED (40h) / INCOMPLETE (<40h) / MISSING (0h). Background colours come
 * from the design tokens (green/yellow/pink 100) in globals.css.
 */
const meta: Record<WeekStatus, { label: string; className: string }> = {
  COMPLETED: { label: "COMPLETED", className: "bg-green-100 text-green-800" },
  INCOMPLETE: { label: "INCOMPLETE", className: "bg-yellow-100 text-[#723B13]" },
  MISSING: { label: "MISSING", className: "bg-pink-100 text-[#99154B]" },
};

export function StatusBadge({ status }: { status: WeekStatus }) {
  const { label, className } = meta[status];
  return (
    <Badge className={classNames("rounded-md border-transparent px-2.5", className)}>
      {label}
    </Badge>
  );
}
