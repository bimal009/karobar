"use client"

import * as React from "react"
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
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
}

export function useDataTableParams(paramPrefix = "") {
  return useQueryStates(
    {
      q: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(10),
    },
    { urlKeys: { q: `${paramPrefix}q`, page: `${paramPrefix}page`, pageSize: `${paramPrefix}pageSize` } }
  )
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  total?: number
  searchPlaceholder?: string
  getSearchValue?: (row: T) => string
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
  getSearchValue,
  rowKey,
  selectable = true,
  filters,
  paramPrefix = "",
  hideSearch = false,
  hidePagination = false,
  isLoading = false,
}: DataTableProps<T>) {
  const [{ q: query, page, pageSize }, setState] = useDataTableParams(paramPrefix)

  const isServerMode = total !== undefined
  const showSearch = !hideSearch && (isServerMode || Boolean(getSearchValue))

  const filtered = React.useMemo(() => {
    if (isServerMode) return data
    if (!query || !getSearchValue) return data
    const q = query.toLowerCase()
    return data.filter((row) => getSearchValue(row).toLowerCase().includes(q))
  }, [data, query, getSearchValue, isServerMode])

  const totalCount = isServerMode ? total : filtered.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginated = isServerMode || hidePagination
    ? filtered
    : filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <Card className="gap-0 p-0">
      {(showSearch || filters) && (
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          {showSearch && (
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
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRowsSkeleton rows={pageSize} columns={columns.length + (selectable ? 1 : 0)} />
            ) : (
              <>
                {paginated.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + (selectable ? 1 : 0)}
                      className="h-24 whitespace-normal text-center text-muted-foreground"
                    >
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
                {paginated.map((row) => (
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
              of {totalCount} entries
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
