"use client"

import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Building2 } from "lucide-react"

function getBreadcrumbs(pathname: string) {
    const segments = pathname.split("/").filter(Boolean)
    return segments.map((segment, index) => ({
        label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
        href: "/" + segments.slice(0, index + 1).join("/"),
        isLast: index === segments.length - 1
    }))
}

export function DashboardHeader() {
    const pathname = usePathname()
    const breadcrumbs = getBreadcrumbs(pathname)

    return (
        <div className="sticky top-0 z-50 bg-white border-b border-slate-100 h-14 flex items-center px-4 shadow-sm justify-between gap-4">
            <div className="flex items-center gap-3">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-5" />
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((crumb, i) => (
                            <span key={crumb.href} className="flex items-center gap-1.5">
                                <BreadcrumbItem>
                                    {crumb.isLast ? (
                                        <BreadcrumbPage className="text-sm font-medium text-[#0f172a]">
                                            {crumb.label}
                                        </BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink href={crumb.href} className="text-sm text-slate-400 hover:text-[#0f172a]">
                                            {crumb.label}
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                                {!crumb.isLast && <BreadcrumbSeparator />}
                            </span>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

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
    )
}