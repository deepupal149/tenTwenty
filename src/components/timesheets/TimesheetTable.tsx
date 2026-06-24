"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import type {
  TimesheetWeek,
  WeekStatus,
  TimesheetSortBy,
  SortDir,
} from "@/lib/types";
import { classNames, formatWeekRange } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Props {
  data: TimesheetWeek[];
  sortBy: TimesheetSortBy;
  sortDir: SortDir;
  onSort: (column: TimesheetSortBy) => void;
  onEdit: (entry: TimesheetWeek) => void;
  onCreate: (entry: TimesheetWeek) => void;
}

/** Action label varies by status, per the design. */
const actionFor = (status: WeekStatus) =>
  status === "COMPLETED"
    ? ("View" as const)
    : status === "INCOMPLETE"
      ? ("Update" as const)
      : ("Create" as const);

/** Direction arrow for a sortable column; muted down-arrow when inactive. */
function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDir;
}) {
  if (active && direction === "asc") {
    return <ArrowUp className="size-3.5 text-gray-700" />;
  }
  return (
    <ArrowDown
      className={classNames(
        "size-3.5",
        active ? "text-gray-700" : "text-gray-300",
      )}
    />
  );
}

export function TimesheetTable({
  data,
  sortBy,
  sortDir,
  onSort,
  onEdit,
  onCreate,
}: Props) {
  if (data.length === 0) {
    return (
      <div className="border-t border-gray-100 p-10 text-center text-sm text-gray-500">
        No timesheet entries match your filters.
      </div>
    );
  }

  const handleAction = (week: TimesheetWeek) =>
    week.status === "MISSING" ? onCreate(week) : onEdit(week);

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onSort("week")}
                  className="h-auto gap-1 p-0 font-medium hover:bg-transparent hover:text-gray-900"
                >
                  Week #{" "}
                  <SortIcon active={sortBy === "week"} direction={sortDir} />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onSort("date")}
                  className="h-auto gap-1 p-0 font-medium hover:bg-transparent hover:text-gray-900"
                >
                  Date <SortIcon active={sortBy === "date"} direction={sortDir} />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onSort("status")}
                  className="h-auto gap-1 p-0 font-medium hover:bg-transparent hover:text-gray-900"
                >
                  Status{" "}
                  <SortIcon active={sortBy === "status"} direction={sortDir} />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((week) => (
              <TableRow key={week.id}>
                <TableCell className="bg-gray-50/50 font-medium text-gray-700">
                  {week.week}
                </TableCell>
                <TableCell className="text-gray-500">
                  {formatWeekRange(week.date)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={week.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => handleAction(week)}
                    className="h-auto px-0 font-medium text-primary-600 hover:underline"
                  >
                    {actionFor(week.status)}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5">
          <span className="text-xs font-medium text-gray-500">Sort by</span>
          {(
            [
              { column: "week", label: "Week" },
              { column: "date", label: "Date" },
              { column: "status", label: "Status" },
            ] as const
          ).map(({ column, label }) => (
            <Button
              key={column}
              type="button"
              variant="ghost"
              onClick={() => onSort(column)}
              className={classNames(
                "h-auto gap-1 rounded-full border px-2.5 py-1 text-xs font-normal hover:bg-transparent",
                sortBy === column
                  ? "border-primary-200 bg-primary-50 text-primary-700"
                  : "border-gray-200 text-gray-600",
              )}
            >
              {label}
              <SortIcon active={sortBy === column} direction={sortDir} />
            </Button>
          ))}
        </div>
        <div className="flex flex-col divide-y divide-gray-100">
          {data.map((week) => (
          <div key={week.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold text-gray-900">Week {week.week}</p>
              <p className="text-sm text-gray-500">
                {formatWeekRange(week.date)}
              </p>
              <div className="mt-2">
                <StatusBadge status={week.status} />
              </div>
            </div>
            <Button
              type="button"
              variant="link"
              onClick={() => handleAction(week)}
              className="h-auto px-0 font-medium text-primary-600 hover:underline"
            >
              {actionFor(week.status)}
            </Button>
          </div>
          ))}
        </div>
      </div>
    </>
  );
}
