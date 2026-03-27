"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function SuccessPayment() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get("session_id")

    return (
        <div className="min-h-160 bg-slate-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md flex flex-col gap-5">

                {/* Icon + Heading */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 size={32} className="text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#0f172a]">Payment Successful</h1>
                        <p className="text-sm text-slate-400 mt-1">Your allowance payment has been processed.</p>
                    </div>
                </div>

                {/* Info Card */}
                <Card className="rounded-xl border border-slate-200 shadow-sm">
                    <CardContent className="px-6 py-5 flex flex-col gap-4">

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                                <ShieldCheck size={16} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#0f172a]">Funds held in escrow</p>
                                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                                    Your payment is securely held in escrow and will be released monthly to the student upon project progress confirmation.
                                </p>
                            </div>
                        </div>

                        {sessionId && (
                            <>
                                <Separator />
                                <div className="flex flex-col gap-1">
                                    <p className="text-[11px] text-slate-400 uppercase tracking-widest">Reference ID</p>
                                    <p className="text-xs font-mono text-slate-500 break-all">{sessionId}</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                    <Button asChild className="w-full gap-1.5 cursor-pointer">
                        <Link href="/finance">
                            Go to Finance Dashboard <ArrowRight size={14} />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full cursor-pointer">
                        <Link href="/project-listings">View Projects</Link>
                    </Button>
                </div>

            </div>
        </div>
    )
}
