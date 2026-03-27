"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import SuccessPayment from "./success"
import CancelPayment from "./cancel"

function PaymentResult() {
    const searchParams = useSearchParams()
    const status = searchParams.get("status")

    if (status === "success") return <SuccessPayment />
    if (status === "cancel") return <CancelPayment />

    return null
}

export default function PaymentPage() {
    return (
        <Suspense>
            <PaymentResult />
        </Suspense>
    )
}
