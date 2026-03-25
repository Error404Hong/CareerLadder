"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CreditCard } from "lucide-react"
import { toast } from "sonner"
import { Project } from "@/types/project"
import { createCheckoutSession } from "@/app/api/payment"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    project: Project | null,
    total_vacancies: number,
}

const PLATFORM_FEE_PERCENT = 5

const calculateTotal = (allowance: string, duration: string, vacancies: number) => {
    const monthMatch = duration.toLowerCase().match(/(\d+)\s*month/)
    const weekMatch = duration.toLowerCase().match(/(\d+)\s*week/)
    const months = monthMatch ? parseInt(monthMatch[1]) : weekMatch ? parseInt(weekMatch[1]) / 4 : 1
    const subtotal = Number(allowance) * months * vacancies
    const platformFee = subtotal * (PLATFORM_FEE_PERCENT / 100)
    return { subtotal, platformFee, total: subtotal + platformFee, months }
}

export function PaymentDialog({ open, onOpenChange, project, total_vacancies }: Props) {
    const { user } = useUser()
    const params = useParams()
    const id = params.id as string
    const applicationId = params.applicationId as string
    const [isPaying, setIsPaying] = useState(false)

    const { subtotal, platformFee, total, months } = project
        ? calculateTotal(project.allowance, project.duration, total_vacancies)
        : { subtotal: 0, platformFee: 0, total: 0, months: 1 }

    const handleProceedToPayment = async () => {
        if (!user || !project) return
        setIsPaying(true)
        try {
            const res = await createCheckoutSession(
                user.id,
                total,
                `Allowance payment for ${project.title} (${total_vacancies} student${total_vacancies !== 1 ? "s" : ""}, ${months} month${months !== 1 ? "s" : ""})`,
                id,
                applicationId,
            )
            if (res.success && res.data?.url) {
                window.location.href = res.data.url
            } else {
                toast.error("Failed to create checkout session")
            }
        } catch {
            toast.error("Failed to create checkout session")
        } finally {
            setIsPaying(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>All Vacancies Filled 🎉</DialogTitle>
                    <DialogDescription>
                        All vacancies for{" "}
                        <span className="font-medium text-[#0f172a]">{project?.title}</span>{" "}
                        have been filled. You are required to make payment to secure the student&apos;s allowance for the duration of the project.
                    </DialogDescription>
                </DialogHeader>

                {/* Payment Breakdown */}
                <div className="bg-slate-100 border border-slate-100 rounded-xl p-4 flex flex-col gap-3">
                    <p className="text-xs text-slate-400 uppercase tracking-widest">Payment Breakdown</p>

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Monthly Allowance</span>
                        <span className="text-sm font-medium text-[#0f172a]">
                            RM {Number(project?.allowance).toLocaleString()}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Duration</span>
                        <span className="text-sm font-medium text-[#0f172a]">
                            {project?.duration} ({months} month{months !== 1 ? "s" : ""})
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Vacancies</span>
                        <span className="text-sm font-medium text-[#0f172a]">
                            {total_vacancies} student{total_vacancies !== 1 ? "s" : ""}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Subtotal</span>
                        <span className="text-sm font-medium text-[#0f172a]">
                            RM {subtotal.toLocaleString()}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Platform Fee ({PLATFORM_FEE_PERCENT}%)</span>
                        <span className="text-sm font-medium text-[#0f172a]">
                            RM {platformFee.toLocaleString()}
                        </span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#0f172a]">Total Amount</span>
                        <span className="text-lg font-bold text-[#0f172a]">RM {total.toLocaleString()}</span>
                    </div>
                </div>

                <p className="text-xs text-slate-400 text-center leading-relaxed">
                    Payment will be held in escrow and released monthly to the student upon project progress confirmation.
                </p>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => onOpenChange(false)}
                    >
                        Later
                    </Button>
                    <Button
                        className="cursor-pointer gap-1.5"
                        disabled={isPaying}
                        onClick={handleProceedToPayment}
                    >
                        <CreditCard size={14} /> {isPaying ? "Redirecting..." : "Proceed to Payment"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}