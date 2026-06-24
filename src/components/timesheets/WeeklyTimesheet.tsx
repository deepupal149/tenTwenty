"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import type { TaskEntry } from "@/lib/types";
import type { TaskValues } from "@/lib/validation";
import { WEEKLY_TARGET_HOURS } from "@/lib/constants";
import { formatWeekRange } from "@/lib/utils";
import { useTasks, useTaskMutations } from "@/hooks/useTasks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TaskRow } from "./TaskRow";
import { TaskEntryForm } from "./TaskEntryForm";

interface Props {
  /** Dashboard timesheet id — scopes the task list/create API calls. */
  weekId: string;
  /** Mon-anchored ISO start date of the week to display. */
  weekStart: string;
}

type ModalState =
  | { mode: "closed" }
  | { mode: "add"; date: string }
  | { mode: "edit"; task: TaskEntry };

/** Build the five Mon–Fri days of the week as { iso, label }. */
function weekDays(weekStart: string) {
  const start = new Date(weekStart);
  return Array.from({ length: 5 }, (_unused, dayOffset) => {
    const date = new Date(start);
    date.setDate(start.getDate() + dayOffset);
    return {
      iso: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
  });
}

export function WeeklyTimesheet({ weekId, weekStart }: Props) {
  const { data, isLoading, isError, error } = useTasks(weekId);
  const { create, update, remove } = useTaskMutations(weekId);

  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [formError, setFormError] = useState<string | null>(null);

  const days = useMemo(() => weekDays(weekStart), [weekStart]);
  const tasks = data ?? [];

  const total = tasks.reduce((sum, task) => sum + task.hours, 0);
  const completionPercent = Math.min(
    100,
    Math.round((total / WEEKLY_TARGET_HOURS) * 100),
  );
  // Existing tasks can always be edited/deleted. Only *adding* a new task is
  // blocked once the week reaches the 40h target.
  const canAdd = total < WEEKLY_TARGET_HOURS;

  const tasksByDay = (iso: string) =>
    tasks.filter((task) => task.date === iso);

  const closeModal = () => {
    setModal({ mode: "closed" });
    setFormError(null);
  };

  const handleSubmit = async (values: TaskValues) => {
    setFormError(null);

    // Client-side mirror of the server's 40h/week cap for instant feedback.
    const editingHours = modal.mode === "edit" ? modal.task.hours : 0;
    const projected = total - editingHours + values.hours;
    if (projected > WEEKLY_TARGET_HOURS) {
      const remaining = WEEKLY_TARGET_HOURS - (total - editingHours);
      setFormError(
        `Only ${remaining}h left this week — a week cannot exceed ${WEEKLY_TARGET_HOURS}h.`,
      );
      return;
    }

    try {
      if (modal.mode === "edit") {
        await update.mutateAsync({ id: modal.task.id, input: values });
      } else {
        await create.mutateAsync(values);
      }
      closeModal();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  };

  const handleDelete = (task: TaskEntry) => remove.mutate(task.id);

  const modalDate =
    modal.mode === "add"
      ? modal.date
      : modal.mode === "edit"
        ? modal.task.date
        : weekStart;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="rounded-xl border border-gray-200 bg-white shadow">
        {/* Header: title, date range, progress */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 p-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              This week&apos;s timesheet
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {formatWeekRange(weekStart)}
            </p>
          </div>
          <div className="w-48">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-gray-700">
                {total}/{WEEKLY_TARGET_HOURS} hrs
              </span>
              <span className="text-gray-400">{completionPercent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-orange-500 transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading timesheet…
            </div>
          )}

          {isError && (
            <div className="flex items-center gap-2 py-4 text-sm text-red-600">
              <AlertCircle className="h-5 w-5" />
              {error instanceof Error ? error.message : "Failed to load tasks"}
            </div>
          )}

          {data &&
            days.map((day) => (
              <div
                key={day.iso}
                className="grid grid-cols-1 gap-3 border-b border-gray-100 py-5 last:border-b-0 sm:grid-cols-[80px_1fr]"
              >
                <p className="pt-2 text-sm font-semibold text-gray-900">
                  {day.label}
                </p>
                <div className="flex flex-col gap-2">
                  {tasksByDay(day.iso).map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onEdit={(task) => setModal({ mode: "edit", task })}
                      onDelete={handleDelete}
                    />
                  ))}

                  {canAdd && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setModal({ mode: "add", date: day.iso })}
                      className="h-auto w-full border border-dashed border-gray-300 py-2.5 font-medium text-primary-600 hover:border-primary-600 hover:bg-primary-100"
                    >
                      <Plus className="size-4" /> Add new task
                    </Button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Add / Edit entry modal (Screen 3) */}
      <Dialog
        open={modal.mode !== "closed"}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent className="gap-0 p-0 sm:max-w-[646px]">
          <DialogHeader className="border-b border-gray-200 px-6 py-4">
            <DialogTitle className="text-lg font-bold text-gray-900">
              {modal.mode === "edit" ? "Edit Entry" : "Add New Entry"}
            </DialogTitle>
          </DialogHeader>
          <TaskEntryForm
            date={modalDate}
            initial={modal.mode === "edit" ? modal.task : undefined}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            submitting={create.isPending || update.isPending}
            error={formError}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
