"use client"

import { Bank } from "@/types"
import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { getBankAccounts, addBankAccount, deleteBankAccount, setDefault } from "@/app/api/bank"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { MALAYSIAN_BANKS } from "@/lib/bankList"

import { toast } from "sonner"
import { Building2, Star, Trash2, Plus, AlertCircle, CreditCard, CheckCircle2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"

const bankFormSchema = z.object({
    bank_name: z.string().min(1, "Bank name is required"),
    account_number: z.string().min(5, "Account number is too short"),
    account_holder_name: z.string().min(2, "Account holder name is required"),
    is_default: z.boolean(),
})

type BankFormValues = z.infer<typeof bankFormSchema>

function maskAccount(accountNumber: string) {
    const digits = accountNumber.replace(/\s/g, "")
    const last4 = digits.slice(-4)
    return `•••• •••• ${last4}`
}

export default function BankPage() {
    const { user } = useUser()

    const [isLoading, setIsLoading] = useState(true)
    const [bankAccounts, setBankAccounts] = useState<Bank[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const form = useForm<BankFormValues>({
        resolver: zodResolver(bankFormSchema),
        defaultValues: {
            bank_name: "",
            account_number: "",
            account_holder_name: "",
            is_default: true,
        },
    })

    const refetch = async () => {
        if (!user) return
        const res = await getBankAccounts(user.id)
        if (res.success) setBankAccounts(res.data)
    }

    useEffect(() => {
        if (!user) return
        const fetch = async () => {
            try {
                const res = await getBankAccounts(user.id)
                if (res.success) setBankAccounts(res.data)
            } catch {
                toast.error("Something went wrong. Please try again")
            } finally {
                setIsLoading(false)
            }
        }
        fetch()
    }, [user])

    const handleAdd = async (values: BankFormValues) => {
        if (!user) return
        setSubmitting(true)
        try {
            const isFirst = bankAccounts.length === 0
            const res = await addBankAccount(user.id, values.bank_name, values.account_number, values.account_holder_name, isFirst || values.is_default)
            if (res.success) {
                toast.success("Bank account added")
                setDialogOpen(false)
                form.reset()
                await refetch()
            } else {
                toast.error("Failed to add bank account")
            }
        } catch {
            toast.error("Something went wrong. Please try again")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!user) return
        try {
            const res = await deleteBankAccount(id, user.id)
            if (res.success) {
                toast.success("Bank account removed")
                await refetch()
            } else {
                toast.error("Failed to remove bank account")
            }
        } catch {
            toast.error("Something went wrong. Please try again")
        }
    }

    const handleSetDefault = async (id: string) => {
        if (!user) return
        try {
            const res = await setDefault(id, user.id)
            if (res.success) {
                toast.success("Default account updated")
                await refetch()
            } else {
                toast.error("Failed to update default")
            }
        } catch {
            toast.error("Something went wrong. Please try again")
        }
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/home">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Bank Accounts</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex items-end justify-between gap-6 flex-wrap">
                        <div>
                            <h1 className="text-xl font-bold text-[#0f172a]">Bank Accounts</h1>
                            <p className="text-sm text-slate-400 mt-1">Manage your saved bank accounts for withdrawals</p>
                        </div>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className=" text-white gap-1.5 cursor-pointer">
                                    <Plus size={15} /> Add Bank Account
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Add Bank Account</DialogTitle>
                                </DialogHeader>
                                <form id="bank-form" onSubmit={form.handleSubmit(handleAdd)}>
                                    <FieldGroup className="py-2">
                                        <Controller name="bank_name" control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <Label htmlFor="bank_name">Bank Name</Label>
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger id="bank_name" aria-invalid={fieldState.invalid}>
                                                            <SelectValue placeholder="Select your bank" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {MALAYSIAN_BANKS.map(b => (
                                                                <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                        <Controller name="account_number" control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <Label htmlFor="account_number">Account Number</Label>
                                                    <Input {...field} id="account_number" placeholder="e.g. 1234567890" aria-invalid={fieldState.invalid} />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                        <Controller name="account_holder_name" control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <Label htmlFor="account_holder_name">Account Holder Name</Label>
                                                    <Input {...field} id="account_holder_name" placeholder="Full name as on bank account" aria-invalid={fieldState.invalid} />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                    </FieldGroup>
                                </form>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                                    <Button
                                        type="submit"
                                        form="bank-form"
                                        disabled={submitting}
                                        className="cursor-pointer text-white"
                                    >
                                        {submitting ? "Adding..." : "Add Account"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>


                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Warning banner — no accounts */}
                {!isLoading && bankAccounts.length === 0 && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                        <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-red-700">No bank account linked</p>
                            <p className="text-xs text-red-500 mt-0.5">Add a bank account to start withdrawing your earnings.</p>
                        </div>
                    </div>
                )}

                {/* Skeleton */}
                {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-44 rounded-2xl" />
                        ))}
                    </div>
                )}

                {/* Account Cards */}
                {!isLoading && bankAccounts.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...bankAccounts].sort((a, b) => Number(b.is_default) - Number(a.is_default)).map((acc) => (
                            <Card
                                key={acc.id}
                                className={`rounded-2xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md ${acc.is_default ? "border-indigo-200 bg-white" : "border-slate-200 bg-white"
                                    }`}
                            >
                                {/* Card top strip */}
                                <div className={`h-1.5 w-full ${acc.is_default ? "bg-indigo-500" : "bg-slate-200"}`} />

                                <CardContent className="px-5 pb-0 flex flex-col gap-4">
                                    {/* Bank name + default badge */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                                <Building2 size={14} className="text-indigo-500" />
                                            </div>
                                            <p className="text-sm font-semibold text-[#0f172a] leading-tight">{acc.bank_name}</p>
                                        </div>
                                        {acc.is_default && (
                                            <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 shrink-0">
                                                <CheckCircle2 size={10} /> Default
                                            </span>
                                        )}
                                    </div>

                                    {/* Account details */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5">
                                            <CreditCard size={12} className="text-slate-400 shrink-0" />
                                            <p className="text-sm font-mono text-slate-600 tracking-wider">{maskAccount(acc.account_number)}</p>
                                        </div>
                                        <p className="text-xs text-slate-400 pl-5">{acc.account_holder_name}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={acc.is_default}
                                            onClick={() => handleSetDefault(acc.id)}
                                            className="flex-1 h-8 text-xs gap-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 cursor-pointer"
                                        >
                                            <Star size={12} /> Set Default
                                        </Button>

                                        <div className="w-px h-4 bg-slate-200 shrink-0" />

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex-1 h-8 text-xs gap-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                                >
                                                    <Trash2 size={12} /> Remove
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Remove Bank Account</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Remove <span className="font-medium text-slate-800">{acc.bank_name}</span> ending in <span className="font-medium text-slate-800">{acc.account_number.slice(-4)}</span>? This cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(acc.id)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        Remove
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}