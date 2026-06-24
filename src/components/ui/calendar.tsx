"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { classNames } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface DateRange {
  from?: string; // yyyy-mm-dd
  to?: string; // yyyy-mm-dd
}

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
  /** How many month grids to show side by side. */
  numberOfMonths?: number;
  /** yyyy-mm-dd — month to open on when nothing is selected. Defaults to today. */
  defaultMonth?: string;
}

const pad = (num: number) => String(num).padStart(2, "0");
const toISO = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function MonthGrid({
  year,
  month,
  value,
  onPick,
}: {
  year: number;
  month: number;
  value: DateRange;
  onPick: (iso: string) => void;
}) {
  const label = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Mon = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, dayIndex) =>
      toISO(new Date(year, month, dayIndex + 1)),
    ),
  ];

  const inRange = (iso: string) =>
    value.from && value.to && iso > value.from && iso < value.to;
  const isEndpoint = (iso: string) => iso === value.from || iso === value.to;

  return (
    <div className="w-full sm:w-[252px]">
      <p className="mb-2 text-center text-sm font-medium text-gray-900">
        {label}
      </p>
      <div className="mb-1 grid grid-cols-7 text-center text-xs text-gray-400">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday} className="py-1">
            {weekday}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((iso, cellIndex) =>
          iso === null ? (
            <span key={`b${cellIndex}`} />
          ) : (
            <Button
              key={iso}
              type="button"
              variant="ghost"
              onClick={() => onPick(iso)}
              className={classNames(
                "mx-auto aspect-square h-auto w-full max-w-9 rounded-md p-0 font-normal text-gray-700 hover:bg-gray-100",
                inRange(iso) &&
                  "bg-primary-100 text-primary-700 hover:bg-primary-100",
                isEndpoint(iso) &&
                  "bg-primary-600 text-white hover:bg-primary-600",
              )}
            >
              {Number(iso.slice(8))}
            </Button>
          ),
        )}
      </div>
    </div>
  );
}

/** Multi-month range picker: first click sets start, next sets end. */
export function Calendar({
  value,
  onChange,
  numberOfMonths = 1,
  defaultMonth,
}: Props) {
  const initial = value.from
    ? new Date(value.from)
    : defaultMonth
      ? new Date(defaultMonth)
      : new Date();
  const [view, setView] = useState({
    year: initial.getFullYear(),
    month: initial.getMonth(),
  });

  const shift = (delta: number) => {
    const date = new Date(view.year, view.month + delta, 1);
    setView({ year: date.getFullYear(), month: date.getMonth() });
  };

  const pick = (iso: string) => {
    const { from, to } = value;
    if (!from || to) {
      onChange({ from: iso, to: undefined }); // start a new range
    } else if (iso < from) {
      onChange({ from: iso, to: from });
    } else {
      onChange({ from, to: iso });
    }
  };

  const months = Array.from({ length: numberOfMonths }, (_, monthOffset) => {
    const date = new Date(view.year, view.month + monthOffset, 1);
    return { year: date.getFullYear(), month: date.getMonth() };
  });

  return (
    <div className="w-full select-none p-3">
      <div className="flex items-start gap-2 sm:gap-6">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Previous month"
          onClick={() => shift(-1)}
          className="rounded-md text-gray-600 hover:bg-gray-100"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="flex flex-1 justify-center gap-4 sm:flex-none sm:gap-6">
          {months.map((monthInfo, monthIndex) => (
            // Extra months would overflow a phone — show only the first below `sm`.
            <div
              key={`${monthInfo.year}-${monthInfo.month}`}
              className={classNames(
                "w-full sm:w-auto",
                monthIndex > 0 && "hidden sm:block",
              )}
            >
              <MonthGrid
                year={monthInfo.year}
                month={monthInfo.month}
                value={value}
                onPick={pick}
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Next month"
          onClick={() => shift(1)}
          className="rounded-md text-gray-600 hover:bg-gray-100"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
