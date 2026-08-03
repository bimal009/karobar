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

export interface DataTableColumn<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  searchPlaceholder?: string
  getSearchValue?: (row: T) => string
  rowKey: (row: T) => string
  selectable?: boolean
  filters?: React.ReactNode
  /** Namespaces the URL query params, only needed if a page renders more than one DataTable. */
  paramPrefix?: string
}

export function DataTable<T>({
  columns,
  data,
  searchPlaceholder = "Search...",
  getSearchValue,
  rowKey,
  selectable = true,
  filters,
  paramPrefix = "",
}: DataTableProps<T>) {
  const [{ q: query, page, pageSize }, setState] = useQueryStates(
    {
      q: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(10),
    },
    { urlKeys: { q: `${paramPrefix}q`, page: `${paramPrefix}page`, pageSize: `${paramPrefix}pageSize` } }
  )

  const filtered = React.useMemo(() => {
    if (!query || !getSearchValue) return data
    const q = query.toLowerCase()
    return data.filter((row) => getSearchValue(row).toLowerCase().includes(q))
  }, [data, query, getSearchValue])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <Card className="gap-0 p-0">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          {getSearchValue && (
            <Input
              placeholder={searchPlaceholder}
              className="pl-8"
              value={query}
              onChange={(e) => setState({ q: e.target.value || null, page: null })}
            />
          )}
        </div>
        {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
      </div>
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
          </TableBody>
        </Table>
      </div>
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
            of {filtered.length} entries
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
    </Card>
  )
}
