"use client"

import { loadStripe } from "@stripe/stripe-js"
import { createCheckoutSession } from "@/app/api/payment"
import { useUser } from "@clerk/nextjs"
import { useState } from "react"
import { toast } from "sonner"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function PaymentPage() {
    const { user } = useUser()
    const [isLoading, setIsLoading] = useState(false)

    const handlePayment = async (amount: number, description: string) => {
        if (!user) return

        try {
            setIsLoading(true)
            const result = await createCheckoutSession(user.id, amount, description)

            if (result.success) {
                // redirect to Stripe hosted checkout page
                const stripe = await stripePromise
                window.location.href = result.data.url
            } else {
                toast.error("Failed to create checkout session")
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 w-full max-w-md flex flex-col gap-6">
                <div>
                    <h1 className="text-xl font-bold text-[#0f172a]">Credits Top Up</h1>
                    <p className="text-sm text-slate-400 mt-1">Select an amount to top up your credits</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {[
                        { amount: 10, credits: 100, label: "RM 10" },
                        { amount: 20, credits: 200, label: "RM 20" },
                        { amount: 50, credits: 500, label: "RM 50" },
                        { amount: 100, credits: 1000, label: "RM 100" },
                    ].map((plan) => (
                        <button
                            key={plan.amount}
                            onClick={() => handlePayment(plan.amount, `${plan.credits} Credits Top Up`)}
                            disabled={isLoading}
                            className="bg-white border border-slate-200 hover:border-[#0f172a] rounded-xl p-4 text-left transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <p className="text-lg font-bold text-[#0f172a]">{plan.label}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{plan.credits} credits</p>
                        </button>
                    ))}
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                        <div className="w-4 h-4 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin" />
                        Redirecting to payment...
                    </div>
                )}
            </div>
        </div>
    )
}