"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, X } from "lucide-react";
import type { WeekStatus, TimesheetSortBy, SortDir } from "@/lib/types";
import { useTimesheets } from "@/hooks/useTimesheets";
import { classNames } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/custom-select";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { TimesheetTable } from "./TimesheetTable";
import { DateRangePicker } from "./DateRangePicker";
import type { DateRange } from "@/components/ui/calendar";

type StatusFilter = "all" | WeekStatus;

export function TimesheetDashboard() {
  const router = useRouter();

  const [status, setStatus] = useState<StatusFilter>("all");
  const [range, setRange] = useState<DateRange>({});
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<TimesheetSortBy>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Toggle direction when re-clicking the active column, otherwise switch
  // column and start descending.
  const toggleSort = (column: TimesheetSortBy) => {
    if (column === sortBy) {
      setSortDir((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("desc");
    }
    setPage(1);
  };

  // date+desc is the server default — omit those params so the initial load's
  // query key matches the SSR-prefetched one (no redundant client refetch).
  const isDefaultSort = sortBy === "date" && sortDir === "desc";

  // Filtering + sorting + pagination happen on the server; each combination is
  // its own request and cache entry.
  const { data, isLoading, isError, error, isPlaceholderData } = useTimesheets({
    page,
    perPage,
    status: status === "all" ? undefined : status,
    from: range.from,
    to: range.to,
    ...(isDefaultSort ? {} : { sortBy, sortDir }),
  });

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;

  const hasFilters = status !== "all" || Boolean(range.from);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(page, totalPages);

  // Open the picker on the most recent week in the current page (page 1, no
  // filter → newest week overall, since rows are sorted descending).
  const latestWeek = rows[0]?.date;

  // View / Update / Create all open the week's detail view (Screen 2) by id.
  const openWeek = (timesheetId: string) => router.push(`/timesheet/${timesheetId}`);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="rounded-xl border border-gray-200 bg-white shadow">
        {/* Header + filters */}
        <div className="p-6">
          <h1 className="mb-4 text-xl font-bold text-gray-900">
            Your Timesheets
          </h1>
          <div className="flex flex-wrap gap-3">
            <DateRangePicker
              value={range}
              defaultMonth={latestWeek || undefined}
              onChange={(nextRange) => {
                setRange(nextRange);
                setPage(1);
              }}
            />
            <CustomSelect
              aria-label="Status"
              value={status}
              onChange={(nextStatus) => {
                setStatus(nextStatus as StatusFilter);
                setPage(1);
              }}
              placeholder="Status"
              options={[
                { value: "all", label: "All statuses" },
                { value: "COMPLETED", label: "Completed" },
                { value: "INCOMPLETE", label: "Incomplete" },
                { value: "MISSING", label: "Missing" },
              ]}
              className="w-[152px]"
              triggerClassName="h-[42px] text-gray-500"
            />
            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStatus("all");
                  setRange({});
                  setPage(1);
                }}
                className="h-[42px] gap-1.5 px-2.5 text-gray-500 hover:text-gray-900"
              >
                <X className="size-4" /> Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="border-t border-gray-200">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading timesheets…
            </div>
          )}

          {isError && (
            <div className="flex items-center gap-2 p-6 text-sm text-red-600">
              <AlertCircle className="h-5 w-5" />
              {error instanceof Error
                ? error.message
                : "Failed to load timesheets"}
            </div>
          )}

          {data && (
            <div
              className={classNames(
                "transition-opacity",
                isPlaceholderData && "opacity-50",
              )}
            >
              <TimesheetTable
                data={rows}
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={toggleSort}
                onEdit={(timesheetWeek) => openWeek(timesheetWeek.id)}
                onCreate={(timesheetWeek) => openWeek(timesheetWeek.id)}
              />
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 p-4">
            <CustomSelect
              aria-label="Rows per page"
              value={String(perPage)}
              onChange={(nextPerPage) => {
                setPerPage(Number(nextPerPage));
                setPage(1);
              }}
              options={[
                { value: "5", label: "5 per page" },
                { value: "10", label: "10 per page" },
                { value: "20", label: "20 per page" },
              ]}
              className="w-32"
            />

            <Pagination
              current={current}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
