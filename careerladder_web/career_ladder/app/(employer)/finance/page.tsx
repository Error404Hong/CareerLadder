"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { createCheckoutSession, getPaymentsByCompany, getPaymentStats, releaseMonthlyPayment } from "@/app/api/payment"
import { toast } from "sonner"

import { Wallet, Clock, ShieldCheck, CheckCircle2, CircleDollarSign } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

import { PaymentStats } from "@/types"
import { ProjectPayment } from "@/types"

import { getPendingColumns } from "./pending-payments/columns"
import { PendingPaymentDataTable } from "./pending-payments/data-table"
import { getEscrowColumns } from "./active-escrow/columns"
import { ActiveEscrowDataTable } from "./active-escrow/data-table"
import { getHistoryColumns } from "./payment-history/columns"
import { PaymentHistoryDataTable } from "./payment-history/data-table"


export default function FinancePage() {
    const { user } = useUser()

    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState<PaymentStats | null>(null)
    const [payments, setPayments] = useState<ProjectPayment[]>([])

    useEffect(() => {
        if (!user) return
        const fetchData = async () => {
            try {
                const [statsRes, paymentsRes] = await Promise.all([
                    getPaymentStats(user.id),
                    getPaymentsByCompany(user.id)
                ])
                if (statsRes.success) setStats(statsRes.data)
                if (paymentsRes.success) setPayments(paymentsRes.data)
            } catch {
                toast.error("Failed to fetch finance data. Please try again")
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [user])

    const statCards = [
        {
            label: "Total Spent",
            value: `RM ${Number(stats?.total_spent ?? 0).toLocaleString()}`,
            sub: `${payments.length} payment${payments.length !== 1 ? "s" : ""} total`,
            icon: Wallet,
            color: "bg-slate-100 text-slate-600"
        },
        {
            label: "Pending Payment",
            value: `RM ${Number(stats?.pending_amount ?? 0).toLocaleString()}`,
            sub: `${stats?.pending_count ?? 0} awaiting payment`,
            icon: Clock,
            color: "bg-yellow-100 text-yellow-600"
        },
        {
            label: "In Escrow",
            value: `RM ${Number(stats?.escrow_amount ?? 0).toLocaleString()}`,
            sub: `${stats?.escrow_count ?? 0} active project${Number(stats?.escrow_count ?? 0) !== 1 ? "s" : ""}`,
            icon: ShieldCheck,
            color: "bg-blue-100 text-blue-600"
        },
        {
            label: "Completed",
            value: `RM ${Number(stats?.completed_amount ?? 0).toLocaleString()}`,
            sub: `${stats?.completed_count ?? 0} fully released`,
            icon: CheckCircle2,
            color: "bg-green-100 text-green-600"
        },
    ]

    const pending = payments.filter(p => p.status === "pending")
    const escrow = payments.filter(p => p.status === "paid" || p.status === "releasing")
    const completed = payments.filter(p => p.status === "completed" || p.status === "refunded")

    const ppColumns = getPendingColumns((payment) => {
        handlePayNow(payment);
    })

    const handleRelease = async (payment: ProjectPayment) => {
        try {
            const res = await releaseMonthlyPayment(payment.id)
            if (res.success) {
                toast.success(`Released RM ${Number(payment.monthly_allowance).toLocaleString()} to ${payment.student_name ?? "student"}`)
                const [statsRes, paymentsRes] = await Promise.all([
                    getPaymentStats(user!.id),
                    getPaymentsByCompany(user!.id),
                ])
                if (statsRes.success) setStats(statsRes.data)
                if (paymentsRes.success) setPayments(paymentsRes.data)
            } else {
                toast.error("Failed to release payment")
            }
        } catch {
            toast.error("Failed to release payment. Please try again.")
        }
    }

    const activeEscrowColumns = getEscrowColumns(handleRelease);
    const paymentHistoryColumns = getHistoryColumns();

    const handlePayNow = async (payment: ProjectPayment) => {
        if (!user) return;

        const res = await createCheckoutSession(
            user.id,
            Number(payment.total_amount),
            `Allowance payment to ${payment.student_name} for ${payment.project_title} (${payment.duration})`,
            "allowance_payment",
            payment.project_id,
            payment.application_id
        )

        if (res.success && res.data?.url) {
            window.location.href = res.data.url
        } else {
            toast.error("Failed to create checkout session")
        }
        console.log("Paying for ", payment)
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Finance</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div>
                    <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Finance Overview</h1>
                    <p className="text-sm text-slate-400 mt-1">Track your project payments and escrow status</p>
                </div>

                {/* Stats */}
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {statCards.map((s) => {
                            const Icon = s.icon
                            return (
                                <Card key={s.label} className="rounded-lg border border-slate-200 shadow-sm">
                                    <CardContent className="px-5 flex flex-col gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                                            <Icon size={15} />
                                        </div>
                                        <p className="text-xl font-bold text-[#0f172a]">{s.value}</p>
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-xs text-slate-400 uppercase tracking-widest">{s.label}</p>
                                            <p className="text-xs text-slate-400">{s.sub}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}

                {/* Pending Payments */}
                <Card className="rounded-lg border border-slate-200 shadow-sm">
                    <CardHeader className="px-5 border-b border-grey-300">
                        <CardTitle className="text-base font-semibold text-[#0f172a]">Pending Payments</CardTitle>
                        <CardDescription>Payments awaiting your action</CardDescription>
                    </CardHeader>

                    <CardContent className="px-6 py-3">
                        <PendingPaymentDataTable
                            columns={ppColumns}
                            data={pending}
                            searchPlaceholder="Search applicants..."
                            emptyIcon={<CircleDollarSign size={32} className="text-slate-200" />}
                            emptyTitle="No pending payments yet"
                            emptyDescription="You're all caught up! Any new pending transactions will appear here for your review."
                        />
                    </CardContent>
                </Card>

                {/* Active Escrow */}
                <Card className="rounded-lg border border-slate-200 shadow-sm">
                    <CardHeader className="px-5 border-b border-grey-300">
                        <CardTitle className="text-base font-semibold text-[#0f172a]">Active Escrow</CardTitle>
                        <CardDescription> Payments currently held in escrow that require your review or approval.</CardDescription>
                    </CardHeader>

                    <CardContent className="px-6 py-3">
                        <ActiveEscrowDataTable
                            columns={activeEscrowColumns}
                            data={escrow}
                            searchPlaceholder="Search applicants..."
                            emptyIcon={<CircleDollarSign size={32} className="text-slate-200" />}
                            emptyTitle="No active escrow transactions yet"
                            emptyDescription="No active escrow transactions at the moment. Any new payments requiring your action will appear here."
                        />
                    </CardContent>
                </Card>

                {/* Payment History */}
                <Card className="rounded-lg border border-slate-200 shadow-sm">
                    <CardHeader className="px-5 border-b border-grey-300">
                        <CardTitle className="text-base font-semibold text-[#0f172a]">Payment History</CardTitle>
                        <CardDescription> View all past transactions that have been successfully processed and completed.</CardDescription>
                    </CardHeader>

                    <CardContent className="px-6 py-3">
                        <PaymentHistoryDataTable
                            columns={paymentHistoryColumns}
                            data={completed}
                            searchPlaceholder="Search applicants..."
                            emptyIcon={<CircleDollarSign size={32} className="text-slate-200" />}
                            emptyTitle="No payment history yet"
                            emptyDescription="Nothing here yet! Completed payments will show up once transactions are successfully processed."
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}