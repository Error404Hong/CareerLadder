"use client"

import { XCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentCancel() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 w-full max-w-md text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle size={32} className="text-red-500" />
                </div>
                <h1 className="text-xl font-bold text-[#0f172a]">Payment Cancelled</h1>
                <p className="text-sm text-slate-400">Your payment was cancelled. No charges were made.</p>
                <Link href="/payment">
                    <button className="mt-2 px-6 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-xl hover:bg-[#1e293b] transition-colors cursor-pointer">
                        Try Again
                    </button>
                </Link>
            </div>
        </div>
    )
}