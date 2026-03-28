"use client"

import { ColumnDef, RowSelectionState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Search } from "lucide-react"
import { useState } from "react"

interface InviteDataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    rowSelection: RowSelectionState
    onRowSelectionChange: (selection: RowSelectionState) => void
}

export function InviteDataTable<TData, TValue>({
    columns,
    data,
    rowSelection,
    onRowSelectionChange,
}: InviteDataTableProps<TData, TValue>) {
    const [globalFilter, setGlobalFilter] = useState("")

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: (updater) => {
            const next = typeof updater === "function" ? updater(rowSelection) : updater
            onRowSelectionChange(next)
        },
        state: { globalFilter, rowSelection },
        initialState: { pagination: { pageSize: 8 } }
    })

    return (
        <div className="flex flex-col gap-4">

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3">
                <div className="w-64">
                    <InputGroup>
                        <InputGroupInput
                            type="text"
                            placeholder="Search students..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="flex-1 text-sm bg-transparent outline-none text-slate-600 placeholder:text-slate-400"
                        />
                        <InputGroupAddon><Search size={13} className="text-slate-400 shrink-0" /></InputGroupAddon>
                    </InputGroup>
                </div>
                <span className="text-xs text-slate-400">
                    {Object.keys(rowSelection).length} selected
                </span>
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
                                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                                        <p className="text-sm font-medium text-slate-400">No students found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="border-b border-slate-300 hover:bg-gray-100 cursor-pointer"
                                    data-state={row.getIsSelected() ? "selected" : undefined}
                                    onClick={() => row.toggleSelected()}
                                >
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
