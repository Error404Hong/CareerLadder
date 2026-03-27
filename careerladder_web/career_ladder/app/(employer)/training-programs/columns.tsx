"use client"

import { Training } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Pencil, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

const statusConfig: Record<string, { label: string; className: string }> = {
    open: { label: "Open", className: "bg-green-100 text-green-700 border border-green-200" },
    closed: { label: "Closed", className: "bg-red-100 text-red-600 border border-red-200" },
    cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-500 border border-slate-200" },
}

export const getColumns = (
    onDelete: (training: Training) => void,
    onEdit: (id: string) => void,
    onView: (id: string) => void
): ColumnDef<Training>[] => [
        {
            accessorKey: "title",
            header: ({ column }) => (
                <button
                    className="text-sm font-medium text-left cursor-pointer flex items-center gap-1"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Title <ArrowUpDown size={12} />
                </button>
            ),
            cell: ({ row }) => <p className="text-sm font-medium text-[#0f172a]">{row.getValue("title")}</p>
        },
        {
            accessorKey: "date",
            header: ({ column }) => (
                <button
                    className="text-sm font-medium text-left cursor-pointer flex items-center gap-1"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date <ArrowUpDown size={12} />
                </button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue("date"))
                return (
                    <span className="text-sm text-slate-500">
                        {date.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                )
            }
        },
        {
            accessorKey: "location",
            header: () => <span className="text-sm font-medium text-left block">Location</span>,
            cell: ({ row }) => (
                <span className="text-sm text-slate-500">{row.getValue("location")}</span>
            )
        },
        {
            id: "registrations",
            header: () => <span className="text-sm font-medium text-left block">Registrations</span>,
            cell: ({ row }) => (
                <span className="text-sm text-slate-500">
                    {Number(row.original.registration_count)} / {row.original.vacancies}
                </span>
            )
        },
        {
            accessorKey: "status",
            header: () => <span className="text-sm font-medium text-left block">Status</span>,
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                const config = statusConfig[status] ?? { label: status, className: "bg-slate-100 text-slate-500 border border-slate-200" }
                return (
                    <span className={`inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full ${config.className}`}>
                        {config.label}
                    </span>
                )
            }
        },
        {
            id: "actions",
            header: () => <span className="text-sm font-medium text-left block">Actions</span>,
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="cursor-pointer text-slate-400 hover:text-[#0f172a] h-8 w-8 p-0"
                        onClick={() => onEdit(row.original.id)}
                    >
                        <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" className="cursor-pointer text-slate-400 hover:text-[#2563eb] h-8 w-8 p-0"
                        onClick={() => onView(row.original.id)}
                    >
                        <Eye size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" className="cursor-pointer text-slate-400 hover:text-red-500 h-8 w-8 p-0"
                        onClick={() => onDelete(row.original)}
                    >
                        <Trash2 size={14} />
                    </Button>
                </div>
            )
        },
    ]
