"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

export type JobApplication = {
    id: string
    clerk_id: string
    listing_id: string
    type: string
    resume_url: string
    cover_letter: string
    skills_fulfilled: string[]
    applied_at: string
    application_status: string
    job_status: string
    title: string
    company_id: string
    employment_type: string
    location: string
    salary_min: number
    salary_max: number
    company_name: string
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    pending: { label: "Pending", className: "bg-yellow-50 text-yellow-600 border border-yellow-100", icon: <Clock size={11} /> },
    reviewed: { label: "Reviewed", className: "bg-blue-50 text-blue-600 border border-blue-100", icon: <AlertCircle size={11} /> },
    shortlisted: { label: "Shortlisted", className: "bg-purple-50 text-purple-600 border border-purple-100", icon: <AlertCircle size={11} /> },
    accepted: { label: "Accepted", className: "bg-green-50 text-green-600 border border-green-100", icon: <CheckCircle2 size={11} /> },
    rejected: { label: "Rejected", className: "bg-red-50 text-red-500 border border-red-100", icon: <XCircle size={11} /> },
}

export const jobColumns: ColumnDef<JobApplication>[] = [
    {
        accessorKey: "title",
        header: ({ column }) => (
            <button
                className="text-sm font-medium text-left cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                <span className="flex items-center gap-1">Position <ArrowUpDown size={12} /></span>
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
        accessorKey: "employment_type",
        header: () => <span className="text-sm font-medium text-left block">Type</span>,
        cell: ({ row }) => <span className="text-sm text-slate-500 capitalize text-left block">{row.getValue("employment_type")}</span>
    },
    {
        accessorKey: "location",
        header: () => <span className="text-sm font-medium text-left block">Location</span>,
        cell: ({ row }) => <span className="text-sm text-slate-500 text-left block">{row.getValue("location")}</span>
    },
    {
        id: "salary",
        header: () => <span className="text-sm font-medium text-left block">Salary</span>,
        cell: ({ row }) => (
            <span className="text-sm text-slate-500 text-left block">
                RM {row.original.salary_min.toLocaleString()} — RM {row.original.salary_max.toLocaleString()}
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
                <span className="flex items-center gap-1">Applied <ArrowUpDown size={12} /></span>
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
]