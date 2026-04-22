"use client"

import { useState } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"
import { User, History, Send } from "lucide-react"
import { ProjectPayment, PaymentRelease } from "@/types"
import { toast } from "sonner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getPaymentReleases } from "@/app/api/payment"
import { Button } from "@/components/ui/button"

function ReleaseHistory({ paymentId }: { paymentId: string }) {
    const [releases, setReleases] = useState<PaymentRelease[]>([])
    const [loaded, setLoaded] = useState(false)
    const [loading, setLoading] = useState(false)

    const loadReleases = async () => {
        if (loaded) return
        setLoading(true)
        try {
            const res = await getPaymentReleases(paymentId)
            if (res.success) setReleases(res.data)
        } catch {
            toast.error("Something went wrong. Please try again")
        } finally {
            setLoading(false)
            setLoaded(true)
        }
    }

    return (
        <Popover onOpenChange={(open) => { if (open) loadReleases() }}>
            <PopoverTrigger asChild>
                <button className="p-1 hover:bg-slate-100 rounded transition-colors" title="View release history">
                    <History size={13} className="text-slate-400 hover:text-slate-600" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="start">
                <p className="text-xs font-semibold text-slate-700 mb-2">Release History</p>
                {loading ? (
                    <p className="text-xs text-slate-400">Loading...</p>
                ) : releases.length === 0 ? (
                    <p className="text-xs text-slate-400">No releases yet.</p>
                ) : (
                    <div className="flex flex-col gap-1.5">
                        {releases.map((r) => (
                            <div key={r.id} className="flex items-center justify-between gap-2 text-xs">
                                <span className="text-slate-500 shrink-0">Month {r.month_number}</span>
                                <span className="font-medium text-slate-700">RM {Number(r.amount_released).toLocaleString()}</span>
                                <span className="text-slate-400 shrink-0">{format(new Date(r.released_at), "d MMM yyyy")}</span>
                            </div>
                        ))}
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}

function ReleaseButton({ payment, onRelease }: { payment: ProjectPayment; onRelease: (p: ProjectPayment) => void }) {
    const canRelease = Number(payment.remaining_amount) > 0
    const monthsReleased = Number(payment.monthly_allowance) > 0
        ? Math.round(Number(payment.paid_amount) / Number(payment.monthly_allowance))
        : 0
    const nextMonth = monthsReleased + 1

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    disabled={!canRelease}
                    size="sm"
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={1} /> Release
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle>Release Month {nextMonth} Payment</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="flex flex-col gap-3 text-sm text-slate-600 w-full">
                            <p>You are about to release the following payment from escrow:</p>
                            <div className="bg-slate-50 rounded-lg p-4 flex flex-col gap-3 border border-slate-200 w-full">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Student</span>
                                    <span className="font-medium text-slate-800">{payment.student_name ?? "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Project</span>
                                    <span className="font-medium text-slate-800">{payment.project_title}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Amount</span>
                                    <span className="font-semibold text-indigo-600">RM {Number(payment.monthly_allowance).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Month</span>
                                    <span className="font-medium text-slate-800">{nextMonth} of {payment.duration_months}</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400">This action cannot be undone.</p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => onRelease(payment)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        Confirm Release
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

const statusConfig: Record<string, { label: string; className: string }> = {
    paid: { label: "In Escrow", className: "bg-blue-100 text-blue-700 border border-blue-200" },
    releasing: { label: "Releasing", className: "bg-purple-100 text-purple-700 border border-purple-200" },
}

export const getEscrowColumns = (onRelease: (payment: ProjectPayment) => void): ColumnDef<ProjectPayment>[] => [
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
        id: "progress",
        header: () => <span className="text-sm font-medium text-left block">Progress</span>,
        cell: ({ row }) => {
            const paid = Number(row.original.paid_amount)
            const monthly = Number(row.original.monthly_allowance)
            const total = Number(row.original.duration_months)
            const released = monthly > 0 ? Math.round(paid / monthly) : 0
            const pct = total > 0 ? (released / total) * 100 : 0

            return (
                <div className="flex flex-col gap-1.5 min-w-36">
                    <div className="flex items-center justify-between gap-1">
                        <span className="text-xs text-slate-500">{released} of {total} months</span>
                        <ReleaseHistory paymentId={row.original.id} />
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-1.5 bg-indigo-400 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                </div>
            )
        }
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
    {
        id: "actions",
        header: () => <span className="text-sm font-medium text-left block">Actions</span>,
        cell: ({ row }) => (
            <ReleaseButton payment={row.original} onRelease={onRelease} />
        )
    },
]
