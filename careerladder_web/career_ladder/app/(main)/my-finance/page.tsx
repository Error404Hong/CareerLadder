"use client"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect, useCallback } from "react"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ProjectPayment, Bank, Withdrawal } from "@/types"
import { getBankAccounts } from "@/app/api/bank"
import { getPaymentsByStudent } from "@/app/api/payment"
import { getAvailableBalance, requestWithdrawal, getWithdrawalRequestByStudent } from "@/app/api/withdrawal"

import { toast } from "sonner"
import { Wallet, ShieldCheck, Clock, TrendingUp, Building2, CalendarDays, CheckCircle2, AlertCircle, BanknoteArrowDown, DollarSign, Plus, CreditCard, Info, ChevronLeft, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"

const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "Awaiting Payment", className: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
    paid: { label: "In Escrow", className: "bg-blue-100 text-blue-700 border border-blue-200" },
    releasing: { label: "Releasing", className: "bg-purple-100 text-purple-700 border border-purple-200" },
    completed: { label: "Completed", className: "bg-green-100 text-green-700 border border-green-200" },
    refunded: { label: "Refunded", className: "bg-red-100 text-red-600 border border-red-200" },
}

const withdrawalStatusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending Review", className: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
    approved: { label: "Approved", className: "bg-blue-100 text-blue-700 border border-blue-200" },
    completed: { label: "Completed", className: "bg-green-100 text-green-700 border border-green-200" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-600 border border-red-200" },
}

const withdrawSchema = z.object({
    bank_id: z.string().min(1, "Please select a bank account"),
    amount: z
        .number({ message: "Enter a valid amount" })
        .min(1, "Amount must be greater than 0"),
})
type WithdrawFormValues = z.infer<typeof withdrawSchema>

function maskAccount(accountNumber: string) {
    const digits = accountNumber.replace(/\s/g, "")
    const last4 = digits.slice(-4)
    return `•••• •••• ${last4}`
}

export default function MyFinance() {
    const { user } = useUser()

    const [isLoading, setIsLoading] = useState(true)
    const [payments, setPayments] = useState<ProjectPayment[]>([])
    const [bankAcc, setBankAcc] = useState<Bank[]>([])

    const [availableBalance, setAvailableBalance] = useState<number>(0)
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
    const [withdrawalLoading, setWithdrawalLoading] = useState(true)
    const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
    const [withdrawSubmitting, setWithdrawSubmitting] = useState(false)
    const [paymentPage, setPaymentPage] = useState(1)
    const [withdrawalPage, setWithdrawalPage] = useState(1)
    const PAGE_SIZE = 5

    const withdrawForm = useForm<WithdrawFormValues>({
        resolver: zodResolver(withdrawSchema),
        defaultValues: { bank_id: "", amount: NaN },
    })

    const selectedBankId = withdrawForm.watch("bank_id")
    const selectedBank = bankAcc.find(b => b.id === selectedBankId)

    const fetchWithdrawalData = useCallback(async () => {
        if (!user) return
        try {
            const [balanceRes, withdrawalRes] = await Promise.all([
                getAvailableBalance(user.id),
                getWithdrawalRequestByStudent(user.id),
            ])
            if (balanceRes.success) setAvailableBalance(Number(balanceRes.data))
            if (withdrawalRes.success) setWithdrawals(withdrawalRes.data)
        } catch {
            toast.error("Failed to fetch withdrawal data")
        } finally {
            setWithdrawalLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (!user) return
        const fetchPayments = async () => {
            try {
                const [paymentRes, bankAccRes] = await Promise.all([
                    getPaymentsByStudent(user.id),
                    getBankAccounts(user.id)
                ])
                if (paymentRes.success) setPayments(paymentRes.data)
                if (bankAccRes.success) setBankAcc(bankAccRes.data)
            } catch {
                toast.error("Failed to fetch payments. Please try again")
            } finally {
                setIsLoading(false)
            }
        }
        fetchPayments()
        fetchWithdrawalData()
    }, [user, fetchWithdrawalData])

    const handleWithdraw = async (values: WithdrawFormValues) => {
        if (!user) return
        if (values.amount > availableBalance) {
            withdrawForm.setError("amount", { message: `Exceeds available balance (RM ${availableBalance.toLocaleString()})` })
            return
        }
        setWithdrawSubmitting(true)
        try {
            const res = await requestWithdrawal(values.bank_id, user.id, values.amount)
            if (res.success) {
                toast.success("Withdrawal request submitted")
                setWithdrawDialogOpen(false)
                withdrawForm.reset()
                await fetchWithdrawalData()
            } else {
                toast.error(res.message || "Failed to submit withdrawal request")
            }
        } catch {
            toast.error("Something went wrong. Please try again")
        } finally {
            setWithdrawSubmitting(false)
        }
    }

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

    const sortedBankAcc = [...bankAcc].sort((a, b) => Number(b.is_default) - Number(a.is_default))

    const totalPaymentPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE))
    const pagedHistory = history.slice((paymentPage - 1) * PAGE_SIZE, paymentPage * PAGE_SIZE)

    const totalWithdrawalPages = Math.max(1, Math.ceil(withdrawals.length / PAGE_SIZE))
    const pagedWithdrawals = withdrawals.slice((withdrawalPage - 1) * PAGE_SIZE, withdrawalPage * PAGE_SIZE)

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

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
                    <h1 className="text-xl font-bold">My Finance</h1>
                    <p className="text-sm text-slate-400 mt-1">Track your allowances, escrow status, and earnings</p>
                </div>

                <Tabs defaultValue="overview">
                    <TabsList variant="line" className="mb-3 gap-3">
                        <TabsTrigger value="overview" className="cursor-pointer"><DollarSign />Finance Overview</TabsTrigger>
                        <TabsTrigger value="withdrawal" className="cursor-pointer"><BanknoteArrowDown />Withdrawal</TabsTrigger>
                    </TabsList>

                    {/* ── Overview Tab ── */}
                    <TabsContent value="overview" className="flex flex-col gap-5">
                        {isLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
                            </div>
                        ) : (
                            <>
                                {bankAcc.length === 0 && (
                                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                                        <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-red-700">No bank account linked</p>
                                            <p className="text-xs text-red-500 mt-0.5">You need to add a bank account before you can withdraw your earnings. <span className="font-medium underline cursor-pointer"><a href="/banks">Click here</a></span> to add one.</p>
                                        </div>
                                    </div>
                                )}
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
                            </>
                        )}

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
                                    <>
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
                                                {pagedHistory.map((p) => (
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
                                        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
                                            <p className="text-xs text-slate-400">
                                                Showing {Math.min((paymentPage - 1) * PAGE_SIZE + 1, history.length)}–{Math.min(paymentPage * PAGE_SIZE, history.length)} of {history.length} row{history.length !== 1 ? "s" : ""}
                                            </p>
                                            <div className="flex items-center gap-1.5">
                                                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 px-2.5" disabled={paymentPage === 1} onClick={() => setPaymentPage(p => p - 1)}>
                                                    <ChevronLeft size={12} /> Previous
                                                </Button>
                                                <span className="font-mono text-xs text-slate-500 px-1">{paymentPage} / {totalPaymentPages}</span>
                                                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 px-2.5" disabled={paymentPage === totalPaymentPages} onClick={() => setPaymentPage(p => p + 1)}>
                                                    Next <ChevronRight size={12} />
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── Withdrawal Tab ── */}
                    <TabsContent value="withdrawal" className="flex flex-col gap-5">

                        {/* Balance + Request button */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Card className="sm:col-span-1 rounded-xl border border-indigo-200 bg-indigo-50 shadow-sm">
                                <CardContent className="px-5 py-0 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                                            <Wallet size={16} className="text-indigo-600" />
                                        </div>
                                        {!withdrawalLoading && bankAcc.length > 0 && availableBalance > 0 && (
                                            <Button
                                                size="sm"
                                                className="gap-1.5 text-white cursor-pointer text-xs h-8"
                                                onClick={() => setWithdrawDialogOpen(true)}
                                            >
                                                <Plus size={13} /> Request Withdraw
                                            </Button>
                                        )}
                                    </div>
                                    {withdrawalLoading ? (
                                        <Skeleton className="h-8 w-32 mt-1" />
                                    ) : (
                                        <p className="text-2xl font-bold text-indigo-900">RM {availableBalance.toLocaleString()}</p>
                                    )}
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-xs text-indigo-600 uppercase tracking-widest font-medium">Available Balance</p>
                                        <p className="text-xs text-indigo-400">Total released minus pending withdrawals</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="sm:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">
                                <CardContent className="px-5 py-0 flex flex-col gap-2.5 h-full justify-center">
                                    <div className="flex items-center gap-2">
                                        <Info size={14} className="text-slate-400 shrink-0" />
                                        <p className="text-sm font-semibold text-[#0f172a]">How withdrawals work</p>
                                    </div>
                                    <ul className="flex flex-col gap-1.5 pl-5 list-disc">
                                        <li className="text-xs text-slate-500">Submit a request with the amount and your bank account</li>
                                        <li className="text-xs text-slate-500">Admin reviews and approves or rejects the request</li>
                                        <li className="text-xs text-slate-500">Once approved, the transfer is made manually within 1–3 business days</li>
                                        <li className="text-xs text-slate-500">You will be notified when the status changes</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        {/* No bank account warning */}
                        {!withdrawalLoading && bankAcc.length === 0 && (
                            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-red-700">No bank account linked</p>
                                    <p className="text-xs text-red-500 mt-0.5">
                                        You need to add a bank account before requesting a withdrawal.{" "}
                                        <a href="/banks" className="font-medium underline">Add one here.</a>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Withdrawal History */}
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-slate-200">
                                <CardTitle className="text-base font-semibold text-[#0f172a]">Withdrawal History</CardTitle>
                                <CardDescription>All your withdrawal requests and their status</CardDescription>
                            </CardHeader>
                            <CardContent className="px-0 py-0">
                                {withdrawalLoading ? (
                                    <div className="flex flex-col gap-3 p-5">
                                        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
                                    </div>
                                ) : withdrawals.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                                        <BanknoteArrowDown size={32} className="text-slate-200" />
                                        <p className="text-sm text-slate-400">No withdrawal requests yet</p>
                                        <p className="text-xs text-slate-300">Your requests will appear here once submitted</p>
                                    </div>
                                ) : (
                                    <>
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-(--color-navy-mid) hover:bg-(--color-navy-light)">
                                                    <TableHead className="px-5 py-3 text-white text-sm font-medium">Date</TableHead>
                                                    <TableHead className="px-5 py-3 text-white text-sm font-medium">Amount</TableHead>
                                                    <TableHead className="px-5 py-3 text-white text-sm font-medium">Bank Account</TableHead>
                                                    <TableHead className="px-5 py-3 text-white text-sm font-medium">Status</TableHead>
                                                    <TableHead className="px-5 py-3 text-white text-sm font-medium">Note</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {pagedWithdrawals.map((w) => (
                                                    <TableRow key={w.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                        <TableCell className="px-5 py-3 text-sm text-slate-500">
                                                            {new Date(w.requested_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                                                        </TableCell>
                                                        <TableCell className="px-5 py-3 text-sm font-semibold text-[#0f172a]">
                                                            RM {Number(w.amount).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="px-5 py-3">
                                                            <p className="text-sm text-[#0f172a]">{w.bank_name}</p>
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <CreditCard size={10} className="text-slate-400" />
                                                                <p className="text-xs text-slate-400 font-mono">{maskAccount(w.account_number)}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-5 py-3">
                                                            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${withdrawalStatusConfig[w.status]?.className}`}>
                                                                {withdrawalStatusConfig[w.status]?.label}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="px-5 py-3 text-xs text-slate-400 max-w-40">
                                                            {w.admin_note ?? "—"}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
                                            <p className="text-xs text-slate-400">
                                                Showing {Math.min((withdrawalPage - 1) * PAGE_SIZE + 1, withdrawals.length)}–{Math.min(withdrawalPage * PAGE_SIZE, withdrawals.length)} of {withdrawals.length} row{withdrawals.length !== 1 ? "s" : ""}
                                            </p>
                                            <div className="flex items-center gap-1.5">
                                                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 px-2.5" disabled={withdrawalPage === 1} onClick={() => setWithdrawalPage(p => p - 1)}>
                                                    <ChevronLeft size={12} /> Previous
                                                </Button>
                                                <span className="font-mono text-xs text-slate-500 px-1">{withdrawalPage} / {totalWithdrawalPages}</span>
                                                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 px-2.5" disabled={withdrawalPage === totalWithdrawalPages} onClick={() => setWithdrawalPage(p => p + 1)}>
                                                    Next <ChevronRight size={12} />
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Request Withdrawal Dialog */}
                        <Dialog open={withdrawDialogOpen} onOpenChange={(open) => {
                            setWithdrawDialogOpen(open)
                            if (!open) withdrawForm.reset()
                        }}>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Request Withdrawal</DialogTitle>
                                </DialogHeader>
                                <form id="withdraw-form" onSubmit={withdrawForm.handleSubmit(handleWithdraw)}>
                                    <FieldGroup className="py-2">
                                        <Controller name="bank_id" control={withdrawForm.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <Label htmlFor="bank_id">Bank Account</Label>
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger id="bank_id" aria-invalid={fieldState.invalid}>
                                                            <SelectValue placeholder="Select a bank account" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {sortedBankAcc.map(b => (
                                                                <SelectItem key={b.id} value={b.id}>
                                                                    {b.bank_name} · {maskAccount(b.account_number)}
                                                                    {b.is_default && " (Default)"}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />

                                        {/* Bank preview */}
                                        {selectedBank && (
                                            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                                                <Building2 size={14} className="text-slate-400 shrink-0" />
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-sm font-medium text-[#0f172a]">{selectedBank.bank_name}</p>
                                                    <p className="text-xs text-slate-400 font-mono">{maskAccount(selectedBank.account_number)}</p>
                                                    <p className="text-xs text-slate-400">{selectedBank.account_holder_name}</p>
                                                </div>
                                            </div>
                                        )}

                                        <Controller name="amount" control={withdrawForm.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <Label htmlFor="amount">
                                                        Amount (RM)
                                                        <span className="text-slate-400 font-normal ml-1">
                                                            — max RM {availableBalance.toLocaleString()}
                                                        </span>
                                                    </Label>
                                                    <Input
                                                        id="amount"
                                                        type="number"
                                                        min={1}
                                                        max={availableBalance}
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        aria-invalid={fieldState.invalid}
                                                        value={isNaN(field.value) || field.value === 0 ? "" : field.value}
                                                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                        onBlur={field.onBlur}
                                                        name={field.name}
                                                        ref={field.ref}
                                                    />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                    </FieldGroup>
                                </form>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>Cancel</Button>
                                    <Button
                                        type="submit"
                                        form="withdraw-form"
                                        disabled={withdrawSubmitting}
                                        className="text-white cursor-pointer"
                                    >
                                        {withdrawSubmitting ? "Submitting..." : "Submit Request"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                    </TabsContent>
                </Tabs>

            </div>
        </div>
    )
}