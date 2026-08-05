"use client"

import * as React from "react"
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { TableRowsSkeleton } from "@/components/shared/loading-skeletons"

export interface DataTableColumn<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  className?: string
  /** Enables sorting on this column. Sent to the server as `sortBy=<sortKey>`. */
  sortKey?: string
}

const sortOrders = ["asc", "desc"] as const

export function useDataTableParams(paramPrefix = "") {
  return useQueryStates(
    {
      q: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(10),
      sortBy: parseAsString.withDefault(""),
      sortOrder: parseAsStringLiteral(sortOrders).withDefault("desc"),
    },
    {
      urlKeys: {
        q: `${paramPrefix}q`,
        page: `${paramPrefix}page`,
        pageSize: `${paramPrefix}pageSize`,
        sortBy: `${paramPrefix}sortBy`,
        sortOrder: `${paramPrefix}sortOrder`,
      },
    }
  )
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  /** Total row count across all pages, as returned by the server. */
  total: number
  searchPlaceholder?: string
  rowKey: (row: T) => string
  selectable?: boolean
  filters?: React.ReactNode
  paramPrefix?: string
  hideSearch?: boolean
  hidePagination?: boolean
  isLoading?: boolean
}

export function DataTable<T>({
  columns,
  data,
  total,
  searchPlaceholder = "Search...",
  rowKey,
  selectable = true,
  filters,
  paramPrefix = "",
  hideSearch = false,
  hidePagination = false,
  isLoading = false,
}: DataTableProps<T>) {
  const [{ q: query, page, pageSize, sortBy, sortOrder }, setState] = useDataTableParams(paramPrefix)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)

  function handleSort(key: string) {
    if (sortBy === key) {
      setState({ sortOrder: sortOrder === "asc" ? "desc" : "asc", page: null })
    } else {
      setState({ sortBy: key, sortOrder: "asc", page: null })
    }
  }

  return (
    <Card className="gap-0 p-0">
      {(!hideSearch || filters) && (
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          {!hideSearch && (
            <div className="relative max-w-xs flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                className="pl-8"
                value={query}
                onChange={(e) => setState({ q: e.target.value || null, page: null })}
              />
            </div>
          )}
          {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {selectable && (
                <TableHead className="w-10">
                  <Checkbox />
                </TableHead>
              )}
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.sortKey ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      onClick={() => handleSort(col.sortKey!)}
                    >
                      {col.header}
                      {sortBy === col.sortKey ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="size-3" />
                        ) : (
                          <ArrowDown className="size-3" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3 text-muted-foreground/50" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRowsSkeleton rows={pageSize} columns={columns.length + (selectable ? 1 : 0)} />
            ) : (
              <>
                {data.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + (selectable ? 1 : 0)}
                      className="h-24 whitespace-normal text-center text-muted-foreground"
                    >
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
                {data.map((row) => (
                  <TableRow key={rowKey(row)}>
                    {selectable && (
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.className}>
                        {col.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>
      {!hidePagination && (
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Row per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => setState({ pageSize: Number(value), page: null })}
            >
              <SelectTrigger size="sm" className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>
              of {total} entries
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage <= 1}
              onClick={() => setState({ page: Math.max(1, currentPage - 1) })}
            >
              <ChevronLeft />
            </Button>
            <span className="px-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage >= totalPages}
              onClick={() => setState({ page: Math.min(totalPages, currentPage + 1) })}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
