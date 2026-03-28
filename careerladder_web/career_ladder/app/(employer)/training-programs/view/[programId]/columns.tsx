"use client"

import { TrainingRegistration } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import Image from "next/image"

const statusConfig: Record<string, { label: string; className: string }> = {
    registered: { label: "Registered", className: "bg-green-100 text-green-700 border border-green-200" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-600 border border-red-200" },
    attended: { label: "Attended", className: "bg-blue-100 text-blue-700 border border-blue-200" },
    absent: { label: "Absent", className: "bg-slate-100 text-slate-500 border border-slate-200" },
}

export const getColumns = (): ColumnDef<TrainingRegistration>[] => [
    {
        id: "participant",
        header: () => <span className="text-sm font-medium text-left block">Participant</span>,
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 bg-slate-100">
                    {row.original.profileImage ? (
                        <Image src={row.original.profileImage} alt={row.original.firstName} width={32} height={32} className="object-cover h-full w-full" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs font-semibold text-slate-400">
                            {row.original.firstName?.[0]}{row.original.lastName?.[0]}
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-sm font-medium text-[#0f172a]">{row.original.firstName} {row.original.lastName}</p>
                    <p className="text-xs text-slate-400">{row.original.email}</p>
                </div>
            </div>
        )
    },
    {
        accessorKey: "registered_at",
        header: ({ column }) => (
            <button
                className="text-sm font-medium text-left cursor-pointer flex items-center gap-1"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Registered At <ArrowUpDown size={12} />
            </button>
        ),
        cell: ({ row }) => (
            <span className="text-sm text-slate-500">
                {new Date(row.getValue("registered_at")).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
            </span>
        )
    },
    {
        accessorKey: "updated_at",
        header: () => <span className="text-sm font-medium text-left block">Last Updated</span>,
        cell: ({ row }) => {
            const val = row.getValue("updated_at") as string
            return (
                <span className="text-sm text-slate-500">
                    {val ? new Date(val).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </span>
            )
        }
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
]
