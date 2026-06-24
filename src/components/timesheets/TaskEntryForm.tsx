"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Loader2, Minus, Plus } from "lucide-react";
import { taskSchema, type TaskValues } from "@/lib/validation";
import type { TaskEntry } from "@/lib/types";
import { PROJECTS, WORK_TYPES } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CustomSelect } from "@/components/ui/custom-select";

interface Props {
  /** Day (yyyy-mm-dd) the task is logged against. */
  date: string;
  /** Existing task when editing; undefined when adding. */
  initial?: TaskEntry;
  onSubmit: (values: TaskValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
  error?: string | null;
}

export function TaskEntryForm({
  date,
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
  } = useForm<TaskValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: initial
      ? {
          date: initial.date,
          project: initial.project,
          typeOfWork: initial.typeOfWork,
          description: initial.description,
          hours: initial.hours,
        }
      : { date, project: "", typeOfWork: "", description: "", hours: 4 },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 px-6 py-5"
      noValidate
    >
      {/* date travels with the form but isn't user-editable here */}
      <input type="hidden" {...register("date")} />

      <div className="flex flex-col gap-1.5">
        <Label className="flex items-center gap-1.5">
          Select Project <span className="text-destructive">*</span>
          <Info className="size-3.5 text-gray-400" />
        </Label>
        <Controller
          control={control}
          name="project"
          render={({ field }) => (
            <CustomSelect
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="Project Name"
              options={PROJECTS.map((project) => ({
                value: project,
                label: project,
              }))}
              invalid={!!errors.project}
              className="w-full sm:w-[364px]"
            />
          )}
        />
        {errors.project && (
          <p className="text-xs text-destructive">{errors.project.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="flex items-center gap-1.5">
          Type of Work <span className="text-destructive">*</span>
          <Info className="size-3.5 text-gray-400" />
        </Label>
        <Controller
          control={control}
          name="typeOfWork"
          render={({ field }) => (
            <CustomSelect
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="Bug fixes"
              options={WORK_TYPES.map((workType) => ({
                value: workType,
                label: workType,
              }))}
              invalid={!!errors.typeOfWork}
              className="w-full sm:w-[364px]"
            />
          )}
        />
        {errors.typeOfWork && (
          <p className="text-xs text-destructive">
            {errors.typeOfWork.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">
          Task description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Write text here …"
          aria-invalid={!!errors.description}
          className="h-[180px] sm:w-[494px]"
          {...register("description")}
        />
        <p className="text-xs text-muted-foreground">A note for extra info</p>
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>
          Hours <span className="text-destructive">*</span>
        </Label>
        <Controller
          control={control}
          name="hours"
          render={({ field }) => (
            <div className="inline-flex w-fit items-center overflow-hidden rounded-lg border border-input">
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                aria-label="Decrease hours"
                onClick={() => field.onChange(Math.max(1, field.value - 1))}
                className="rounded-none text-gray-600"
                disabled={field.value <= 1}
              >
                <Minus className="size-4" />
              </Button>
              <span className="flex h-9 w-12 items-center justify-center border-x border-input text-sm tabular-nums">
                {field.value}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                aria-label="Increase hours"
                onClick={() => field.onChange(Math.min(24, field.value + 1))}
                className="rounded-none text-gray-600"
                disabled={field.value >= 24}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          )}
        />
        {errors.hours && (
          <p className="text-xs text-destructive">{errors.hours.message}</p>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="-mx-6 -mb-5 mt-2 flex gap-3 border-t border-gray-200 px-6 py-4">
        <Button type="submit" disabled={submitting} className="h-11 flex-1">
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {initial ? "Save changes" : "Add entry"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-11 flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
