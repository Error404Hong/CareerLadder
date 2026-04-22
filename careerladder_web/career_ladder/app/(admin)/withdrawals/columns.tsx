"use client"

import { Withdrawal } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, CheckCircle, XCircle, BadgeCheck, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending Review", className: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
    approved: { label: "Approved", className: "bg-blue-100 text-blue-700 border border-blue-200" },
    completed: { label: "Completed", className: "bg-green-100 text-green-700 border border-green-200" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-600 border border-red-200" },
}

function maskAccount(accountNumber: string) {
    const digits = accountNumber.replace(/\s/g, "")
    return `•••• •••• ${digits.slice(-4)}`
}

export const getWithdrawalColumns = (
    onApprove: (id: string) => void,
    onReject: (withdrawal: Withdrawal) => void,
    onComplete: (id: string) => void,
    actionLoadingId: string | null,
): ColumnDef<Withdrawal>[] => [
    {
        accessorKey: "account_holder_name",
        header: ({ column }) => (
            <button
                className="text-sm font-medium text-left cursor-pointer flex items-center gap-1"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Student <ArrowUpDown size={12} />
            </button>
        ),
        cell: ({ row }) => (
            <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium text-[#0f172a]">{row.getValue("account_holder_name")}</p>
                <p className="text-xs text-slate-400 font-mono">{String(row.original.student_id).slice(0, 18)}…</p>
            </div>
        ),
    },
    {
        accessorKey: "amount",
        header: ({ column }) => (
            <button
                className="text-sm font-medium text-left cursor-pointer flex items-center gap-1"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Amount <ArrowUpDown size={12} />
            </button>
        ),
        cell: ({ row }) => (
            <p className="text-sm font-semibold text-[#0f172a]">
                RM {Number(row.getValue("amount")).toLocaleString()}
            </p>
        ),
    },
    {
        id: "bank",
        header: () => <span className="text-sm font-medium">Bank Account</span>,
        cell: ({ row }) => (
            <div className="flex flex-col gap-0.5">
                <p className="text-sm text-[#0f172a]">{row.original.bank_name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                    <CreditCard size={10} className="text-slate-400" />
                    <p className="text-xs text-slate-400 font-mono">{maskAccount(row.original.account_number)}</p>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "requested_at",
        header: ({ column }) => (
            <button
                className="text-sm font-medium text-left cursor-pointer flex items-center gap-1"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Requested <ArrowUpDown size={12} />
            </button>
        ),
        cell: ({ row }) => (
            <span className="text-sm text-slate-400">
                {new Date(row.getValue("requested_at")).toLocaleDateString("en-MY", {
                    year: "numeric", month: "short", day: "numeric",
                })}
            </span>
        ),
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
        },
    },
    {
        id: "admin_note",
        header: () => <span className="text-sm font-medium">Note</span>,
        cell: ({ row }) => (
            <span className="text-xs text-slate-400 max-w-40 block truncate">
                {row.original.admin_note ?? "—"}
            </span>
        ),
    },
    {
        id: "actions",
        header: () => <span className="text-sm font-medium">Actions</span>,
        cell: ({ row }) => {
            const { status, id } = row.original
            const isLoading = actionLoadingId === id

            if (status === "pending") {
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            className="h-8 text-xs cursor-pointer bg-green-600 hover:bg-green-700 text-white gap-1"
                            onClick={() => onApprove(id)}
                            disabled={isLoading}
                        >
                            <CheckCircle size={12} /> Approve
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs cursor-pointer text-red-600 border-red-200 hover:bg-red-50 gap-1"
                            onClick={() => onReject(row.original)}
                            disabled={isLoading}
                        >
                            <XCircle size={12} /> Reject
                        </Button>
                    </div>
                )
            }

            if (status === "approved") {
                return (
                    <Button
                        size="sm"
                        className="h-8 text-xs cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
                        onClick={() => onComplete(id)}
                        disabled={isLoading}
                    >
                        <BadgeCheck size={12} /> Mark Completed
                    </Button>
                )
            }

            return <span className="text-xs text-slate-300">—</span>
        },
    },
]
