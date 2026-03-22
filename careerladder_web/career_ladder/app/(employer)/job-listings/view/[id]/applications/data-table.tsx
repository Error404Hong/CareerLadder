"use client"

import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Search } from "lucide-react"
import { useState } from "react"

interface DataTableProps<TData extends { first_name?: string | null; last_name?: string | null }, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchPlaceholder?: string
    emptyTitle?: string
    emptyDescription?: string
    emptyIcon?: React.ReactNode
}

export function DataTable<TData extends { first_name?: string | null; last_name?: string | null }, TValue>({
    columns,
    data,
    searchPlaceholder = "Search...",
    emptyTitle = "No results",
    emptyDescription,
    emptyIcon,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = useState("")
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        state: { sorting, globalFilter, columnFilters },
        initialState: { pagination: { pageSize: 10 } },
        globalFilterFn: (row, columnId, filterValue) => {
            const search = filterValue.toLowerCase()
            const data = row.original as Record<string, unknown>
            const fullName = `${data.first_name ?? ""} ${data.last_name ?? ""}`.toLowerCase()
            const values = Object.values(data).map(v => String(v ?? "").toLowerCase())
            return fullName.includes(search) || values.some(v => v.includes(search))
        }
    })

    return (
        <div className="flex flex-col gap-4">

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-64">
                        <InputGroup>
                            <InputGroupInput
                                type="text"
                                placeholder={searchPlaceholder}
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="flex-1 text-sm bg-transparent outline-none text-slate-600 placeholder:text-slate-400"
                            />
                            <InputGroupAddon><Search size={13} className="text-slate-400 shrink-0" /></InputGroupAddon>
                        </InputGroup>
                    </div>

                    {/* Status Filter */}
                    <Select
                        value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
                        onValueChange={(value) =>
                            table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value)
                        }
                    >
                        <SelectTrigger className="h-9 w-36 text-sm rounded-md border-slate-200">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="text-xs text-slate-400">
                    <span>{table.getFilteredRowModel().rows.length} result{table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}</span>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-slate-300 overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-b border-slate-300 bg-(--color-navy-mid) hover:bg-(--color-navy-light)">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="px-6 py-4 text-white text-left">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length}>
                                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                                        {emptyIcon}
                                        <p className="text-sm font-medium text-slate-400">{emptyTitle}</p>
                                        {emptyDescription && <p className="text-xs text-slate-300">{emptyDescription}</p>}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="border-b border-slate-300 hover:bg-gray-100">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-6 py-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </p>
                <Pagination className="w-fit mx-0">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => table.previousPage()}
                                className={!table.getCanPreviousPage() ? "pointer-events-none opacity-40 cursor-not-allowed" : "cursor-pointer"}
                            />
                        </PaginationItem>
                        {Array.from({ length: table.getPageCount() }, (_, i) => {
                            const page = i + 1
                            const currentPage = table.getState().pagination.pageIndex + 1
                            const isFirst = i === 0
                            const isLast = i === table.getPageCount() - 1
                            const isNearCurrent = Math.abs(currentPage - page) <= 1

                            if (isFirst || isLast || isNearCurrent) {
                                return (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            onClick={() => table.setPageIndex(i)}
                                            isActive={currentPage === page}
                                            className="cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            }
                            if (Math.abs(currentPage - page) === 2) {
                                return <PaginationItem key={i}><PaginationEllipsis /></PaginationItem>
                            }
                            return null
                        })}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => table.nextPage()}
                                className={!table.getCanNextPage() ? "pointer-events-none opacity-40 cursor-not-allowed" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}