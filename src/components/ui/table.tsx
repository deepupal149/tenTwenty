import * as React from "react"

import { classNames } from "@/lib/utils"

/**
 * Thin semantic wrappers around the native table elements so feature code
 * composes <Table>/<TableRow>/<TableCell> instead of repeating raw <table>
 * markup and utility classes. Styling stays overridable via `className`.
 */

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <table
      data-slot="table"
      className={classNames("w-full text-left text-sm", className)}
      {...props}
    />
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={classNames(
        "bg-gray-50 text-xs uppercase tracking-wide text-gray-500",
        className,
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={classNames("divide-y divide-gray-100", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={classNames("hover:bg-gray-50", className)}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={classNames("px-6 py-3 font-medium", className)}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={classNames("px-6 py-4", className)}
      {...props}
    />
  )
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
