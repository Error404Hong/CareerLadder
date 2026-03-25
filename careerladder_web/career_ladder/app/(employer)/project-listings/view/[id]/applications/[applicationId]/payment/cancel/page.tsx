"use client"

import { useParams, useRouter } from "next/navigation"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"

export default function PaymentCancelPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string
    const applicationId = params.applicationId as string

    return (
        <div className="min-h-160 bg-slate-50 flex items-center justify-center px-4">
            <Card className="w-full max-w-md border border-slate-200 shadow-sm rounded-2xl">
                <CardContent className="flex flex-col items-center gap-5 py-10 px-8">

                    {/* Icon */}
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle size={36} className="text-red-500" strokeWidth={1.8} />
                    </div>

                    {/* Text */}
                    <div className="flex flex-col items-center gap-1.5 text-center">
                        <h1 className="text-xl font-bold text-[#0f172a]">Payment Cancelled</h1>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                            Your payment was not completed. No charges have been made. You can retry the payment at any time from the application page.
                        </p>
                    </div>

                    <Separator />

                    {/* Info pill */}
                    <div className="w-full bg-yellow-50 border border-yellow-100 rounded-lg px-4 py-3 flex flex-col gap-1.5">
                        <p className="text-xs text-yellow-700 font-medium">Important</p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            All vacancies are still filled and applications have been accepted. Payment is required to secure the students&apos; allowances and officially start the project.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 w-full mt-1">
                        <Button
                            variant="outline"
                            className="flex-1 cursor-pointer"
                            onClick={() => router.push(`/project-listings/view/${id}/applications/${applicationId}`)}
                        >
                            Back to Application
                        </Button>
                        <Button
                            className="flex-1 cursor-pointer"
                            onClick={() => router.push(`/project-listings/view/${id}`)}
                        >
                            View Project
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
