"use client"

import Link from "next/link"
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function CancelPayment() {
    return (
        <div className="min-h-160 bg-slate-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md flex flex-col gap-5">

                {/* Icon + Heading */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle size={32} className="text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#0f172a]">Payment Cancelled</h1>
                        <p className="text-sm text-slate-400 mt-1">Your payment was not completed. No charges were made.</p>
                    </div>
                </div>

                {/* Info Card */}
                <Card className="rounded-xl border border-slate-200 shadow-sm">
                    <CardContent className="px-6 py-5 flex flex-col gap-3">
                        <p className="text-sm text-slate-500 leading-relaxed">
                            The checkout process was cancelled. Your pending payment is still on hold — you can complete it anytime from the Finance dashboard.
                        </p>
                        <div className="bg-yellow-50 border border-yellow-100 rounded-lg px-4 py-3">
                            <p className="text-xs text-yellow-700 leading-relaxed">
                                Student allowances will not be secured until the payment is completed.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                    <Button asChild className="w-full gap-1.5 cursor-pointer">
                        <Link href="/finance">
                            <RotateCcw size={14} /> Retry Payment
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full gap-1.5 cursor-pointer">
                        <Link href="/dashboard">
                            <ArrowLeft size={14} /> Back to Dashboard
                        </Link>
                    </Button>
                </div>

            </div>
        </div>
    )
}
