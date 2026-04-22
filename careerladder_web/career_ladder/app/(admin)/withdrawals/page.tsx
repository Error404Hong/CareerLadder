"use client"

import { Withdrawal } from "@/types"
import { getAllWithdrawalRequest, approveRequest, rejectRequest, completeRequest } from "@/app/api/withdrawal"
import { useEffect, useState, useCallback } from "react"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { toast } from "sonner"
import { BanknoteArrowDown, Clock, CheckCircle2, XCircle, BadgeCheck } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Field, FieldError } from "@/components/ui/field"
import { DataTable } from "./data-table"
import { getWithdrawalColumns } from "./columns"

const rejectSchema = z.object({
    note: z.string().min(1, "Please provide a reason for rejection"),
})
type RejectFormValues = z.infer<typeof rejectSchema>

export default function WithdrawalRequestPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

    const [rejectTarget, setRejectTarget] = useState<Withdrawal | null>(null)
    const [rejectSheetOpen, setRejectSheetOpen] = useState(false)
    const [rejectSubmitting, setRejectSubmitting] = useState(false)

    const rejectForm = useForm<RejectFormValues>({
        resolver: zodResolver(rejectSchema),
        defaultValues: { note: "" },
    })

    const fetchWithdrawals = useCallback(async () => {
        try {
            const res = await getAllWithdrawalRequest()
            if (res.success) setWithdrawals(res.data)
        } catch {
            toast.error("Failed to load withdrawal requests")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchWithdrawals()
    }, [fetchWithdrawals])

    const handleApprove = async (id: string) => {
        setActionLoadingId(id)
        try {
            const res = await approveRequest(id)
            if (res.success) {
                toast.success("Withdrawal approved")
                await fetchWithdrawals()
            } else {
                toast.error(res.message || "Failed to approve withdrawal")
            }
        } catch {
            toast.error("Something went wrong. Please try again")
        } finally {
            setActionLoadingId(null)
        }
    }

    const handleRejectOpen = (withdrawal: Withdrawal) => {
        setRejectTarget(withdrawal)
        rejectForm.reset()
        setRejectSheetOpen(true)
    }

    const handleRejectSubmit = async (values: RejectFormValues) => {
        if (!rejectTarget) return
        setRejectSubmitting(true)
        try {
            const res = await rejectRequest(rejectTarget.id, values.note)
            if (res.success) {
                toast.success("Withdrawal rejected")
                setRejectSheetOpen(false)
                setRejectTarget(null)
                rejectForm.reset()
                await fetchWithdrawals()
            } else {
                toast.error(res.message || "Failed to reject withdrawal")
            }
        } catch {
            toast.error("Something went wrong. Please try again")
        } finally {
            setRejectSubmitting(false)
        }
    }

    const handleComplete = async (id: string) => {
        setActionLoadingId(id)
        try {
            const res = await completeRequest(id)
            if (res.success) {
                toast.success("Marked as completed")
                await fetchWithdrawals()
            } else {
                toast.error(res.message || "Failed to complete withdrawal")
            }
        } catch {
            toast.error("Something went wrong. Please try again")
        } finally {
            setActionLoadingId(null)
        }
    }

    const columns = getWithdrawalColumns(handleApprove, handleRejectOpen, handleComplete, actionLoadingId)

    const totalPending = withdrawals.filter(w => w.status === "pending").length
    const totalApproved = withdrawals.filter(w => w.status === "approved").length
    const totalCompleted = withdrawals.filter(w => w.status === "completed").length
    const totalRejected = withdrawals.filter(w => w.status === "rejected").length
    const totalCompletedAmount = withdrawals
        .filter(w => w.status === "completed")
        .reduce((sum, w) => sum + Number(w.amount), 0)

    const statCards = [
        { label: "Pending Review", value: totalPending, icon: Clock, color: "bg-yellow-100 text-yellow-600" },
        { label: "Approved", value: totalApproved, icon: CheckCircle2, color: "bg-blue-100 text-blue-600" },
        { label: "Completed", value: totalCompleted, icon: BadgeCheck, color: "bg-green-100 text-green-600" },
        { label: "Rejected", value: totalRejected, icon: XCircle, color: "bg-red-100 text-red-500" },
        {
            label: "Total Disbursed",
            value: `RM ${totalCompletedAmount.toLocaleString()}`,
            icon: BanknoteArrowDown,
            color: "bg-indigo-100 text-indigo-600",
        },
    ]

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">

                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin-dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Withdrawal Management</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div>
                    <h1 className="text-xl font-bold text-[#0f172a]">Withdrawal Requests</h1>
                    <p className="text-sm text-slate-400 mt-1">Review and manage student withdrawal requests</p>
                </div>

                {/* Stat Cards */}
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {statCards.map((s) => {
                            const Icon = s.icon
                            return (
                                <Card key={s.label} className="rounded-lg border border-slate-200 shadow-sm">
                                    <CardContent className="px-4 py-0 flex flex-col gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                                            <Icon size={15} />
                                        </div>
                                        <p className="text-lg font-bold text-[#0f172a]">{s.value}</p>
                                        <p className="text-xs text-slate-400 uppercase tracking-widest">{s.label}</p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}

                {/* DataTable */}
                {isLoading ? (
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                    </div>
                ) : (
                    <Card className="rounded-lg border border-slate-200 shadow-sm">
                        <CardHeader className="px-5 border-b border-slate-100">
                            <CardTitle className="text-xl font-bold">Withdrawal Requests</CardTitle>
                            <CardDescription>Track, review, and manage all withdrawal requests efficiently.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-5 py-4">
                            <DataTable
                                columns={columns}
                                data={withdrawals}
                                searchPlaceholder="Search by student or bank..."
                                emptyTitle="No withdrawal requests"
                                emptyDescription="Requests submitted by students will appear here"
                                emptyIcon={<BanknoteArrowDown size={32} className="text-slate-200" />}
                            />
                        </CardContent>
                    </Card>

                )}

            </div>

            {/* Reject Sheet — slides from top */}
            <Sheet open={rejectSheetOpen} onOpenChange={(open) => {
                setRejectSheetOpen(open)
                if (!open) { rejectForm.reset(); setRejectTarget(null) }
            }}>
                <SheetContent side="top" className="py-8 flex items-center justify-center">
                    <div className="w-full max-w-xl flex flex-col gap-4">
                        <SheetHeader className="p-0">
                            <SheetTitle className="text-base font-semibold text-red-700">Reject Withdrawal Request</SheetTitle>
                            {rejectTarget && (
                                <SheetDescription>
                                    Rejecting <span className="font-medium text-slate-700">{rejectTarget.account_holder_name}</span>&apos;s request for{" "}
                                    <span className="font-medium text-slate-700">RM {Number(rejectTarget.amount).toLocaleString()}</span>.
                                    The amount will be restored to their available balance.
                                </SheetDescription>
                            )}
                        </SheetHeader>

                        <form id="reject-form" onSubmit={rejectForm.handleSubmit(handleRejectSubmit)}>
                            <Controller name="note" control={rejectForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="note">Reason for rejection <span className="text-red-500">*</span></Label>
                                        <Textarea
                                            {...field}
                                            id="note"
                                            rows={3}
                                            placeholder="Provide a clear reason so the student understands why the request was rejected..."
                                            aria-invalid={fieldState.invalid}
                                            className="resize-none"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </form>

                        <SheetFooter className="p-0 flex-row gap-2 justify-start">
                            <Button
                                type="submit"
                                form="reject-form"
                                disabled={rejectSubmitting}
                                className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                            >
                                {rejectSubmitting ? "Rejecting..." : "Confirm Rejection"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setRejectSheetOpen(false)}
                                disabled={rejectSubmitting}
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                        </SheetFooter>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
