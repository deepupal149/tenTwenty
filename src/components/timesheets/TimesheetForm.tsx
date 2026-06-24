"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { timesheetSchema, type TimesheetValues } from "@/lib/validation";
import type { Timesheet } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";

interface Props {
  /** Existing entry when editing; undefined when creating. */
  initial?: Timesheet;
  onSubmit: (values: TimesheetValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
  error?: string | null;
}

export function TimesheetForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
  error,
}: Props) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TimesheetValues>({
    resolver: zodResolver(timesheetSchema),
    defaultValues: initial
      ? {
          week: initial.week,
          date: initial.date,
          project: initial.project,
          hours: initial.hours,
          status: initial.status,
        }
      : { week: 1, date: "", project: "", hours: 8, status: "pending" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="week">Week #</Label>
          <Input
            id="week"
            type="number"
            min={1}
            max={53}
            aria-invalid={!!errors.week}
            {...register("week", { valueAsNumber: true })}
          />
          {errors.week && (
            <p className="text-xs text-destructive">{errors.week.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            aria-invalid={!!errors.date}
            {...register("date")}
          />
          {errors.date && (
            <p className="text-xs text-destructive">{errors.date.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="project">Project</Label>
        <Input
          id="project"
          placeholder="e.g. Acme Dashboard"
          aria-invalid={!!errors.project}
          {...register("project")}
        />
        {errors.project && (
          <p className="text-xs text-destructive">{errors.project.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hours">Hours</Label>
          <Input
            id="hours"
            type="number"
            step="0.5"
            min={0.5}
            aria-invalid={!!errors.hours}
            {...register("hours", { valueAsNumber: true })}
          />
          {errors.hours && (
            <p className="text-xs text-destructive">{errors.hours.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <CustomSelect
                id="status"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "approved", label: "Approved" },
                  { value: "rejected", label: "Rejected" },
                ]}
              />
            )}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {initial ? "Save changes" : "Add entry"}
        </Button>
      </div>
    </form>
  );
}
