"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { TaskEntry } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  task: TaskEntry;
  readOnly?: boolean;
  onEdit: (task: TaskEntry) => void;
  onDelete: (task: TaskEntry) => void;
}

/** A single logged task: name, hours, project tag, and a ⋯ Edit/Delete menu. */
export function TaskRow({ task, readOnly, onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5">
      <span className="flex-1 truncate text-sm font-medium text-gray-900">
        {task.description}
      </span>
      <span className="shrink-0 text-sm text-gray-500">{task.hours} hrs</span>
      <Badge className="shrink-0 rounded-md border-transparent bg-primary-100 px-2.5 text-primary-700">
        {task.project}
      </Badge>

      {readOnly ? (
        // Spacer keeps row layout aligned with editable weeks.
        <span className="w-7 shrink-0" />
      ) : (
        <div className="relative shrink-0" ref={menuRef}>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Task options"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((isOpen) => !isOpen)}
            className="rounded-md text-gray-500 hover:bg-gray-100"
          >
            <MoreHorizontal className="size-4" />
          </Button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 z-10 mt-1 w-32 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
            >
              <Button
                type="button"
                variant="ghost"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onEdit(task);
                }}
                className="h-auto w-full justify-start gap-2 rounded-none px-3 py-2 font-normal text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="size-4" /> Edit
              </Button>
              <Button
                type="button"
                variant="ghost"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onDelete(task);
                }}
                className="h-auto w-full justify-start gap-2 rounded-none px-3 py-2 font-normal text-red-600 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="size-4" /> Delete
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
