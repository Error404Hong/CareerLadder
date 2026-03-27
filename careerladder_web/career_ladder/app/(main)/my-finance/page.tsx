"use client"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { ProjectPayment } from "@/types"
import { getPaymentsByStudent } from "@/app/api/payment"

import { toast } from "sonner"
import { Wallet, ShieldCheck, Clock, TrendingUp, Building2, CalendarDays, CheckCircle2, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "Awaiting Payment", className: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
    paid: { label: "In Escrow", className: "bg-blue-100 text-blue-700 border border-blue-200" },
    releasing: { label: "Releasing", className: "bg-purple-100 text-purple-700 border border-purple-200" },
    completed: { label: "Completed", className: "bg-green-100 text-green-700 border border-green-200" },
    refunded: { label: "Refunded", className: "bg-red-100 text-red-600 border border-red-200" },
}

export default function MyFinance() {
    const { user } = useUser()

    const [isLoading, setIsLoading] = useState(true)
    const [payments, setPayments] = useState<ProjectPayment[]>([])

    useEffect(() => {
        if (!user) return
        const fetchPayments = async () => {
            try {
                const fetchRes = await getPaymentsByStudent(user.id)
                if (fetchRes.success) {
                    setPayments(fetchRes.data)
                } else {
                    toast.error("Failed to fetch payments. Please try again")
                }
            } catch {
                toast.error("Failed to fetch payments. Please try again")
            } finally {
                setIsLoading(false)
            }
        }
        fetchPayments()
    }, [user])

    const active = payments.filter(p => p.status === "paid" || p.status === "releasing")
    const pending = payments.filter(p => p.status === "pending")
    const history = payments.filter(p => p.status === "completed" || p.status === "refunded")

    const totalEarned = active.reduce((sum, p) => sum + Number(p.paid_amount), 0)
        + history.filter(p => p.status === "completed").reduce((sum, p) => sum + Number(p.total_amount), 0)
    const inEscrow = active.reduce((sum, p) => sum + Number(p.remaining_amount), 0)
    const monthlyIncome = active.reduce((sum, p) => sum + Number(p.monthly_allowance), 0)

    const statCards = [
        {
            label: "Total Earned",
            value: `RM ${totalEarned.toLocaleString()}`,
            sub: `${history.filter(p => p.status === "completed").length} completed project${history.filter(p => p.status === "completed").length !== 1 ? "s" : ""}`,
            icon: Wallet,
            color: "bg-slate-100 text-slate-600"
        },
        {
            label: "In Escrow",
            value: `RM ${inEscrow.toLocaleString()}`,
            sub: "Secured, pending release",
            icon: ShieldCheck,
            color: "bg-blue-100 text-blue-600"
        },
        {
            label: "Monthly Income",
            value: `RM ${monthlyIncome.toLocaleString()}`,
            sub: `${active.length} active project${active.length !== 1 ? "s" : ""}`,
            icon: TrendingUp,
            color: "bg-green-100 text-green-600"
        },
        {
            label: "Awaiting Employer",
            value: `${pending.length}`,
            sub: `project${pending.length !== 1 ? "s" : ""} pending payment`,
            icon: Clock,
            color: "bg-yellow-100 text-yellow-600"
        },
    ]

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-6">

                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/home">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>My Finance</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div>
                    <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">My Finance</h1>
                    <p className="text-sm text-slate-400 mt-1">Track your allowances, escrow status, and earnings</p>
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

                {/* Pending — Awaiting Employer Payment */}
                {!isLoading && pending.length > 0 && (
                    <Card className="rounded-lg border border-yellow-200 bg-yellow-50 shadow-sm">
                        <CardHeader className="px-5 pb-3 border-b border-yellow-200">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={15} className="text-yellow-600" />
                                <CardTitle className="text-base font-semibold text-yellow-800">Awaiting Employer Payment</CardTitle>
                            </div>
                            <CardDescription className="text-yellow-700">
                                The employer has not yet paid for the following project{pending.length !== 1 ? "s" : ""}. Your allowance will be secured once payment is made.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-5 py-3 flex flex-col gap-3">
                            {pending.map((p) => (
                                <div key={p.id} className="flex items-center justify-between gap-4 flex-wrap">
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-sm font-medium text-[#0f172a]">{p.project_title}</p>
                                        <p className="text-xs text-slate-400">
                                            RM {Number(p.monthly_allowance).toLocaleString()} / mo · {p.duration_months} month{p.duration_months !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusConfig["pending"].className}`}>
                                        {statusConfig["pending"].label}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Active Allowances — In Escrow */}
                <Card className="rounded-lg border border-slate-200 shadow-sm">
                    <CardHeader className="px-5 border-b border-slate-200">
                        <CardTitle className="text-base font-semibold text-[#0f172a]">Active Allowances</CardTitle>
                        <CardDescription>Payments secured in escrow and being released monthly</CardDescription>
                    </CardHeader>
                    <CardContent className="px-5 py-4">
                        {isLoading ? (
                            <div className="flex flex-col gap-3">
                                {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
                            </div>
                        ) : active.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-2">
                                <ShieldCheck size={32} className="text-slate-200" />
                                <p className="text-sm text-slate-400">No active allowances</p>
                                <p className="text-xs text-slate-300">Secured payments will appear here once an employer confirms your project</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {active.map((p) => {
                                    const paidNum = Number(p.paid_amount)
                                    const totalNum = Number(p.total_amount)
                                    const progressPct = totalNum > 0 ? Math.round((paidNum / totalNum) * 100) : 0
                                    return (
                                        <div key={p.id} className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex flex-col gap-3">
                                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                                <div>
                                                    <p className="text-sm font-semibold text-[#0f172a]">{p.project_title}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Building2 size={11} className="text-slate-400" />
                                                        <p className="text-xs text-slate-400">{(p as ProjectPayment & { company_name?: string }).company_name ?? "—"}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusConfig[p.status]?.className}`}>
                                                    {statusConfig[p.status]?.label}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <p className="text-[11px] text-slate-400 uppercase tracking-widest">Monthly</p>
                                                    <p className="text-sm font-semibold text-[#0f172a] mt-0.5">RM {Number(p.monthly_allowance).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] text-slate-400 uppercase tracking-widest">Released</p>
                                                    <p className="text-sm font-semibold text-green-600 mt-0.5">RM {Number(p.paid_amount).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] text-slate-400 uppercase tracking-widest">Remaining</p>
                                                    <p className="text-sm font-semibold text-[#0f172a] mt-0.5">RM {Number(p.remaining_amount).toLocaleString()}</p>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                                        <CalendarDays size={11} />
                                                        {p.duration_months} month{p.duration_months !== 1 ? "s" : ""} total
                                                    </div>
                                                    <p className="text-xs text-slate-400">{progressPct}% released</p>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full transition-all"
                                                        style={{ width: `${progressPct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Payment History */}
                <Card className="rounded-lg border border-slate-200 shadow-sm">
                    <CardHeader className="px-5 border-b border-slate-200">
                        <CardTitle className="text-base font-semibold text-[#0f172a]">Payment History</CardTitle>
                        <CardDescription>Completed and refunded payments</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 py-0">
                        {isLoading ? (
                            <div className="flex flex-col gap-3 p-5">
                                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
                            </div>
                        ) : history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-2">
                                <CheckCircle2 size={32} className="text-slate-200" />
                                <p className="text-sm text-slate-400">No payment history yet</p>
                                <p className="text-xs text-slate-300">Completed payments will appear here</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-(--color-navy-mid) hover:bg-(--color-navy-light)">
                                        <TableHead className="px-5 py-3 text-white text-sm font-medium">Project</TableHead>
                                        <TableHead className="px-5 py-3 text-white text-sm font-medium">Duration</TableHead>
                                        <TableHead className="px-5 py-3 text-white text-sm font-medium">Total Received</TableHead>
                                        <TableHead className="px-5 py-3 text-white text-sm font-medium">Completed On</TableHead>
                                        <TableHead className="px-5 py-3 text-white text-sm font-medium">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.map((p) => (
                                        <TableRow key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <TableCell className="px-5 py-3">
                                                <p className="text-sm font-medium text-[#0f172a]">{p.project_title}</p>
                                                <p className="text-xs text-slate-400">{(p as ProjectPayment & { company_name?: string }).company_name ?? "—"}</p>
                                            </TableCell>
                                            <TableCell className="px-5 py-3 text-sm text-slate-500">
                                                {p.duration_months} month{p.duration_months !== 1 ? "s" : ""}
                                            </TableCell>
                                            <TableCell className="px-5 py-3 text-sm font-semibold text-[#0f172a]">
                                                RM {Number(p.total_amount).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="px-5 py-3 text-sm text-slate-500">
                                                {p.paid_at
                                                    ? new Date(p.paid_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })
                                                    : "—"}
                                            </TableCell>
                                            <TableCell className="px-5 py-3">
                                                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusConfig[p.status]?.className}`}>
                                                    {statusConfig[p.status]?.label}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
