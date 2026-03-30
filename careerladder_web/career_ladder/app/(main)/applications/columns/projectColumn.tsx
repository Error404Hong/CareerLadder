"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

export type ProjectApplication = {
    id: string
    clerk_id: string
    listing_id: string
    type: string
    resume_url: string
    cover_letter: string
    skills_fulfilled: string[]
    applied_at: string
    application_status: string
    project_status: string
    title: string
    company_id: string
    duration: string
    allowance: number
    start_date: string
    end_date: string
    company_name: string
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-600 border border-yellow-100", icon: <Clock size={13} /> },
    reviewed: { label: "Reviewed", className: "bg-blue-100 text-blue-600 border border-blue-100", icon: <AlertCircle size={13} /> },
    shortlisted: { label: "Shortlisted", className: "bg-purple-100 text-purple-600 border border-purple-100", icon: <AlertCircle size={13} /> },
    accepted: { label: "Accepted", className: "bg-green-100 text-green-600 border border-green-100", icon: <CheckCircle2 size={13} /> },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-500 border border-red-100", icon: <XCircle size={13} /> },
}

export const projectColumns = (
    onView: (project: ProjectApplication) => void
): ColumnDef<ProjectApplication>[] => [
        {
            accessorKey: "title",
            header: ({ column }) => (
                <button
                    className="text-sm font-medium text-left cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span className="flex items-center gap-1">Project <ArrowUpDown size={13} /></span>
                </button>
            ),
            cell: ({ row }) => <p className="text-sm font-medium text-[#0f172a] text-left">{row.getValue("title")}</p>
        },
        {
            accessorKey: "company_name",
            header: () => <span className="text-sm font-medium text-left block">Company</span>,
            cell: ({ row }) => <p className="text-sm text-[#2563eb] font-medium text-left">{row.getValue("company_name")}</p>
        },
        {
            accessorKey: "duration",
            header: () => <span className="text-sm font-medium text-left block">Duration</span>,
            cell: ({ row }) => <span className="text-sm text-slate-500 text-left block">{row.getValue("duration")}</span>
        },
        {
            accessorKey: "allowance",
            header: () => <span className="text-sm font-medium text-left block">Allowance</span>,
            cell: ({ row }) => <span className="text-sm text-slate-500 text-left block">RM {(row.getValue("allowance") as number).toLocaleString()}/mo</span>
        },
        {
            id: "period",
            header: () => <span className="text-sm font-medium text-left block">Period</span>,
            cell: ({ row }) => (
                <span className="text-sm text-slate-500 text-left block">
                    {new Date(row.original.start_date).toLocaleDateString("en-MY", { month: "short", year: "numeric" })} —{" "}
                    {new Date(row.original.end_date).toLocaleDateString("en-MY", { month: "short", year: "numeric" })}
                </span>
            )
        },
        {
            accessorKey: "applied_at",
            header: ({ column }) => (
                <button
                    className="text-sm font-medium text-left cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <span className="flex items-center gap-1">Applied <ArrowUpDown size={13} /></span>
                </button>
            ),
            cell: ({ row }) => (
                <span className="text-sm text-slate-500 text-left block">
                    {new Date(row.getValue("applied_at")).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                </span>
            )
        },
        {
            accessorKey: "application_status",
            header: () => <span className="text-sm font-medium text-left block">Status</span>,
            cell: ({ row }) => {
                const status = row.getValue("application_status") as string
                const config = statusConfig[status] ?? { label: status, className: "bg-slate-100 text-slate-500 border border-slate-200", icon: null }
                return (
                    <span className={`inline-flex items-center gap-1 text-[12px] font-medium px-2.5 py-1.5 rounded-full ${config.className}`}>
                        {config.icon}{config.label}
                    </span>
                )
            }
        },
        {
            id: "actions",
            header: () => <span className="text-sm font-medium text-left block">Actions</span>,
            cell: ({ row }) => (
                <Button
                    size="sm"
                    className="cursor-pointer text-xs"
                    onClick={() => onView(row.original)}
                >
                    View
                </Button>
            )
        }
    ]