"use client"

import Image from "next/image"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, User } from "lucide-react"
import { ProjectPayment } from "@/types"

const statusConfig: Record<string, { label: string; className: string }> = {
    paid: { label: "In Escrow", className: "bg-blue-100 text-blue-700 border border-blue-200" },
    releasing: { label: "Releasing", className: "bg-purple-100 text-purple-700 border border-purple-200" },
}

export const getEscrowColumns = (): ColumnDef<ProjectPayment>[] => [
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
        accessorKey: "monthly_allowance",
        header: () => <span className="text-sm font-medium text-left block">Monthly</span>,
        cell: ({ row }) => (
            <span className="text-sm text-slate-500">
                RM {Number(row.getValue("monthly_allowance")).toLocaleString()}
            </span>
        )
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
        accessorKey: "paid_amount",
        header: ({ column }) => (
            <button
                className="text-sm font-medium flex items-center gap-1 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Released <ArrowUpDown size={12} />
            </button>
        ),
        cell: ({ row }) => (
            <span className="text-sm text-slate-500">
                RM {Number(row.getValue("paid_amount")).toLocaleString()}
            </span>
        )
    },
    {
        accessorKey: "remaining_amount",
        header: ({ column }) => (
            <button
                className="text-sm font-medium flex items-center gap-1 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Remaining <ArrowUpDown size={12} />
            </button>
        ),
        cell: ({ row }) => (
            <span className="text-sm font-semibold text-[#0f172a]">
                RM {Number(row.getValue("remaining_amount")).toLocaleString()}
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
