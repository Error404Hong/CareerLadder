"use client"

import { ClerkProvider } from "@clerk/nextjs"

export function ClientClerkProvider({ children }: { children: React.ReactNode }) {
    return <ClerkProvider afterSignOutUrl="/sign-in">{children}</ClerkProvider>
}