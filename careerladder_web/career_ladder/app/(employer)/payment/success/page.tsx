"use client"

import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccess() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 w-full max-w-md text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h1 className="text-xl font-bold text-[#0f172a]">Payment Successful!</h1>
                <p className="text-sm text-slate-400">Your credits have been topped up successfully.</p>
                <Link href="/dashboard">
                    <button className="mt-2 px-6 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-xl hover:bg-[#1e293b] transition-colors cursor-pointer">
                        Back to Home
                    </button>
                </Link>
            </div>
        </div>
    )
}