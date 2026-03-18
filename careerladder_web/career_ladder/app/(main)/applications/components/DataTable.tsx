"use client"

import {
    ColumnDef, SortingState,
    flexRender, getCoreRowModel, getSortedRowModel,
    getFilteredRowModel, useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"
import { Search } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: string
    searchPlaceholder?: string
    emptyIcon?: React.ReactNode
    emptyTitle?: string
    emptyDescription?: string
}

export function DataTable<TData, TValue>({
    columns, data, searchKey, searchPlaceholder = "Search...",
    emptyIcon, emptyTitle = "No results", emptyDescription,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = useState("")

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        state: { sorting, globalFilter },
    })

    return (
        <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="sm:w-60">
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

            {/* Table */}
            <div className="rounded-2xl border border-slate-300 overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-b border-slate-300 bg-(--color-navy-mid) hover:bg-(--color-navy-light)">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="px-6 py-3 text-white">
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
                                <TableRow key={row.id} className="border-b border-slate-300 hover:bg-gray-50">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-6 py-3 ">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                    {table.getFilteredRowModel().rows.length} result{table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
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