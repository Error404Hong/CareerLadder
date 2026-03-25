"use client"

import { useParams, useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"

export default function PaymentSuccessPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    return (
        <div className="min-h-160 bg-slate-50 flex items-center justify-center px-4">
            <Card className="w-full max-w-md border border-slate-200 shadow-sm rounded-2xl">
                <CardContent className="flex flex-col items-center gap-5 py-10 px-8">

                    {/* Icon */}
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 size={36} className="text-green-600" strokeWidth={1.8} />
                    </div>

                    {/* Text */}
                    <div className="flex flex-col items-center gap-1.5 text-center">
                        <h1 className="text-xl font-bold text-[#0f172a]">Payment Successful</h1>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                            Your payment has been processed successfully. The allowance has been secured and will be released monthly to the students upon project progress confirmation.
                        </p>
                    </div>

                    <Separator />

                    {/* Info pill */}
                    <div className="w-full bg-green-50 border border-green-100 rounded-lg px-4 py-3 flex flex-col gap-1.5">
                        <p className="text-xs text-green-700 font-medium">What happens next?</p>
                        <ul className="text-xs text-slate-500 list-disc list-inside space-y-1 leading-relaxed">
                            <li>Students will be notified of their acceptance</li>
                            <li>Allowance is held securely in escrow</li>
                            <li>Payments are released monthly upon progress confirmation</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 w-full mt-1">
                        <Button
                            variant="outline"
                            className="flex-1 cursor-pointer"
                            onClick={() => router.push(`/project-listings/view/${id}`)}
                        >
                            View Project
                        </Button>
                        <Button
                            className="flex-1 cursor-pointer"
                            onClick={() => router.push("/project-listings")}
                        >
                            My Listings
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
