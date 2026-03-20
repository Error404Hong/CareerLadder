"use client"


import { Toaster } from "sonner"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { Building2 } from "lucide-react"


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 min-h-screen bg-slate-50">
                <div className="sticky top-0 z-50 bg-white border-b border-slate-100 h-15 flex items-center px-4 shadow-sm justify-between">
                    <SidebarTrigger />
                    <SignedIn>
                        <div className="px-3 py-1.5">
                            <UserButton showName>
                                <UserButton.MenuItems>
                                    <UserButton.Link
                                        href="/company-profile"
                                        labelIcon={<Building2 size={14} />}
                                        label="Company Profile"
                                    />
                                    <UserButton.Action label="manageAccount" />
                                    <UserButton.Action label="signOut" />
                                </UserButton.MenuItems>
                            </UserButton>
                        </div>
                    </SignedIn>
                    <SignedOut>
                        <div className="flex items-center gap-2 px-3">
                            <Link href="/sign-in">
                                <button className="text-sm text-slate-600 hover:text-[#0f172a] px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                                    Login
                                </button>
                            </Link>
                            <Link href="/register">
                                <button className="text-sm text-white bg-[#0f172a] hover:bg-[#1e293b] px-4 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm">
                                    Register
                                </button>
                            </Link>
                        </div>
                    </SignedOut>
                </div>
                <div className="p-6">
                    {children}
                </div>
                <Toaster position="top-left" richColors />
            </main>
        </SidebarProvider>
    )
}