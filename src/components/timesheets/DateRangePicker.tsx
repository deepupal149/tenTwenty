"use client";

import { useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Calendar, type DateRange } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { classNames } from "@/lib/utils";

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
  /** yyyy-mm-dd — month to open on when nothing is selected. */
  defaultMonth?: string;
}

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export function DateRangePicker({ value, onChange, defaultMonth }: Props) {
  const [open, setOpen] = useState(false);
  // Draft holds the in-progress selection; only applied on OK.
  const [draft, setDraft] = useState<DateRange>(value);

  const triggerLabel =
    value.from && value.to
      ? `${formatDate(value.from)} – ${formatDate(value.to)}`
      : "Date Range";

  const draftLabel =
    draft.from && draft.to
      ? `${formatDate(draft.from)} – ${formatDate(draft.to)}`
      : draft.from
        ? `${formatDate(draft.from)} – select end date`
        : "Select a start date";

  const apply = () => {
    // Allow a single-day range if only the start was picked.
    onChange(draft.from && !draft.to ? { from: draft.from, to: draft.from } : draft);
    setOpen(false);
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) setDraft(value); // reset draft to the applied value on open
        setOpen(nextOpen);
      }}
    >
      <Popover.Trigger
        className={classNames(
          "flex h-[42px] min-w-[152px] items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          value.from ? "text-gray-700" : "text-gray-500",
        )}
      >
        <CalendarDays className="size-4 shrink-0 text-gray-400" />
        <span className="flex-1 truncate text-left">{triggerLabel}</span>
        <ChevronDown className="size-4 shrink-0 text-gray-400" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" sideOffset={6} className="isolate z-50">
          <Popover.Popup className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] origin-(--transform-origin) rounded-xl bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 sm:w-auto">
            <Calendar
              value={draft}
              onChange={setDraft}
              numberOfMonths={2}
              defaultMonth={defaultMonth}
            />

            <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
              <span className="text-sm text-gray-500">{draftLabel}</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDraft({})}
                  disabled={!draft.from}
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={apply} disabled={!draft.from}>
                  OK
                </Button>
              </div>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
