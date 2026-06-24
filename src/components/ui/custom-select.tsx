"use client";

import * as React from "react";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { classNames } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface SelectOption {
  value: string;
  label: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: ReadonlyArray<SelectOption>;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  /** Applied to the relative wrapper — set width here. */
  className?: string;
  /** Applied to the trigger button — set height/colors here. */
  triggerClassName?: string;
  "aria-label"?: string;
}

/**
 * Lightweight custom dropdown. The option list is an absolutely-positioned
 * child of a `relative` wrapper — NOT a portal and NOT a native <select>.
 *
 * Modals center themselves with a CSS `transform`, which breaks viewport-based
 * popups: native <select> dropdowns (and floating-ui anchored popups) misplace
 * to the top-left under a transformed ancestor on Chromium. Anchoring the list
 * to its own relatively-positioned container sidesteps that entirely, so this
 * one component works the same inside and outside a modal.
 */
export function CustomSelect({
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  invalid,
  disabled,
  id,
  className,
  triggerClassName,
  "aria-label": ariaLabel,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={containerRef} className={classNames("relative w-full", className)}>
      <Button
        type="button"
        variant="ghost"
        id={id}
        role="combobox"
        aria-label={ariaLabel}
        aria-invalid={invalid}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        onClick={() => setOpen((isOpen) => !isOpen)}
        onBlur={onBlur}
        className={classNames(
          "h-9 w-full justify-between gap-2 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 font-normal transition-colors hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
          triggerClassName,
        )}
      >
        <span
          className={classNames("truncate", !selected && "text-muted-foreground")}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </Button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-full left-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-input bg-popover py-1 text-popover-foreground shadow-md"
        >
          {options.map((option) => (
            <li key={option.value}>
              <Button
                type="button"
                variant="ghost"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={classNames(
                  "h-auto w-full justify-start rounded-none px-2.5 py-1.5 font-normal hover:bg-accent hover:text-accent-foreground",
                  option.value === value && "bg-accent/50",
                )}
              >
                {option.label}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
