"use client"

import Image from "next/image"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, User } from "lucide-react"
import { ProjectPayment } from "@/types"

const statusConfig: Record<string, { label: string; className: string }> = {
    completed: { label: "Completed", className: "bg-green-100 text-green-700 border border-green-200" },
    refunded: { label: "Refunded", className: "bg-red-100 text-red-600 border border-red-200" },
}

export const getHistoryColumns = (): ColumnDef<ProjectPayment>[] => [
    {
        accessorKey: "paid_at",
        header: ({ column }) => (
            <button
                className="text-sm font-medium flex items-center gap-1 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Date <ArrowUpDown size={12} />
            </button>
        ),
        cell: ({ row }) => {
            const date = row.getValue("paid_at") as string | null
            return (
                <span className="text-sm text-slate-500">
                    {date ? new Date(date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </span>
            )
        }
    },
    {
        id: "student",
        header: () => <span className="text-sm font-medium text-left block">Student</span>,
        cell: ({ row }) => (
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {row.original.student_image ? (
                        <Image src={row.original.student_image} alt="student" width={32} height={32} className="object-cover" />
                    ) : (
                        <User size={14} className="text-slate-300" />
                    )}
                </div>
                <div>
                    <p className="text-sm font-medium text-[#0f172a]">{row.original.student_name ?? "—"}</p>
                    <p className="text-xs text-slate-400">{row.original.student_email ?? "—"}</p>
                </div>
            </div>
        )
    },
    {
        accessorKey: "project_title",
        header: () => <span className="text-sm font-medium text-left block">Project</span>,
        cell: ({ row }) => <span className="text-sm text-slate-500">{row.getValue("project_title")}</span>
    },
    {
        accessorKey: "duration_months",
        header: () => <span className="text-sm font-medium text-left block">Duration</span>,
        cell: ({ row }) => (
            <span className="text-sm text-slate-500">
                {row.getValue("duration_months")} month{Number(row.getValue("duration_months")) !== 1 ? "s" : ""}
            </span>
        )
    },
    {
        accessorKey: "monthly_allowance",
        header: () => <span className="text-sm font-medium text-left block">Monthly</span>,
        cell: ({ row }) => (
            <span className="text-sm text-slate-500">
                RM {Number(row.getValue("monthly_allowance")).toLocaleString()}
            </span>
        )
    },
    {
        accessorKey: "total_amount",
        header: ({ column }) => (
            <button
                className="text-sm font-medium flex items-center gap-1 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Total Paid <ArrowUpDown size={12} />
            </button>
        ),
        cell: ({ row }) => (
            <span className="text-sm font-semibold text-[#0f172a]">
                RM {Number(row.getValue("total_amount")).toLocaleString()}
            </span>
        )
    },
    {
        accessorKey: "status",
        header: () => <span className="text-sm font-medium text-left block">Status</span>,
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const config = statusConfig[status]
            return (
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${config?.className ?? "bg-slate-100 text-slate-500"}`}>
                    {config?.label ?? status}
                </span>
            )
        }
    },
]
