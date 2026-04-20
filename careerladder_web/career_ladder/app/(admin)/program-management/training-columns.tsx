"use client"

import Image from "next/image"
import { Training } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const statusConfig: Record<string, { label: string; className: string }> = {
    open: { label: "Open", className: "bg-green-100 text-green-700 border border-green-200" },
    closed: { label: "Closed", className: "bg-red-100 text-red-600 border border-red-200" },
    completed: { label: "Completed", className: "bg-slate-100 text-slate-600 border border-slate-200" },
    cancelled: { label: "Cancelled", className: "bg-orange-100 text-orange-600 border border-orange-200" },
}

export const getTrainingColumns = (
    onView: (id: string) => void,
    onDelete: (training: Training) => void
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
            id: "company",
            header: () => <span className="text-sm font-medium">Company</span>,
            cell: ({ row }) => {
                const logo = row.original.company_logo_url
                const name = row.original.company_name ?? "—"
                return (
                    <div className="flex items-center gap-2">
                        {logo ? (
                            <Image src={logo} alt={name} width={24} height={24} className="w-6 h-6 rounded object-cover border border-slate-200 shrink-0" />
                        ) : (
                            <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-500 shrink-0">
                                {name[0]}
                            </div>
                        )}
                        <span className="text-sm text-slate-600 truncate max-w-[140px]">{name}</span>
                    </div>
                )
            }
        },
        {
            accessorKey: "location",
            header: () => <span className="text-sm font-medium">Location</span>,
            cell: ({ row }) => {
                const location = row.getValue("location") as string
                const meetingUrl = row.original.meeting_url
                return (
                    <span className="text-sm text-slate-500">
                        {meetingUrl && !location ? "Online" : location || "—"}
                    </span>
                )
            }
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
            cell: ({ row }) => (
                <span className="text-sm text-slate-400">
                    {new Date(row.getValue("date")).toLocaleDateString("en-MY", { year: "numeric", month: "short", day: "numeric" })}
                </span>
            )
        },
        {
            accessorKey: "status",
            header: () => <span className="text-sm font-medium">Status</span>,
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                const config = statusConfig[status] ?? { label: status, className: "bg-slate-100 text-slate-500 border border-slate-200" }
                return (
                    <span className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${config.className}`}>
                        {config.label}
                    </span>
                )
            },
            filterFn: (row, columnId, filterValue) => {
                if (!filterValue) return true
                return row.getValue(columnId) === filterValue
            }
        },
        {
            id: "actions",
            header: () => <span className="text-sm font-medium">Actions</span>,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button size="sm" className="h-8 text-xs cursor-pointer" onClick={() => onView(row.original.id)}>
                        View
                    </Button>
                    <Button size="sm" className="h-8 text-xs cursor-pointer bg-red-500 hover:bg-red-500/85" onClick={() => onDelete(row.original)}>
                        Delete
                    </Button>
                </div>
            )
        },
    ]
