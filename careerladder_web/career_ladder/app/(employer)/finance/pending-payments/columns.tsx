"use client"

import Image from "next/image"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectPayment } from "@/types"

export const getPendingColumns = (
    onPay: (payment: ProjectPayment) => void
): ColumnDef<ProjectPayment>[] => [
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
                        <p className="text-sm font-medium text-[#0f172a]">{row.original.student_name ?? "-"} </p>
                        <p className="text-xs text-slate-400">{row.original.student_email}</p>
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
            header: () => <span className="text-sm font-medium text-left block">Allowance / mo</span>,
            cell: ({ row }) => (
                <span className="text-sm text-slate-500">RM {Number(row.getValue("monthly_allowance")).toLocaleString()}</span>
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
            accessorKey: "total_amount",
            header: ({ column }) => (
                <button
                    className="text-sm font-medium flex items-center gap-1 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Total <ArrowUpDown size={12} />
                </button>
            ),
            cell: ({ row }) => (
                <span className="text-sm font-semibold text-[#0f172a]">
                    RM {Number(row.getValue("total_amount")).toLocaleString()}
                </span>
            )
        },
        {
            id: "actions",
            header: () => <span className="text-sm font-medium text-left block">Action</span>,
            cell: ({ row }) => (
                <Button
                    size="sm"
                    className="cursor-pointer text-xs gap-1.5"
                    onClick={() => onPay(row.original)}
                >
                    Pay Now
                </Button>
            )
        }
    ]