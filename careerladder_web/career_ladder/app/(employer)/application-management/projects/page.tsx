"use client"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getProjectAppByCom } from "@/app/api/project"
import { ProjectApplication } from "@/types/projectApplication"
import { toast } from "sonner"

import { FileText, Clock, CheckCircle2, XCircle, Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

import { getColumns } from "./columns"
import { DataTable } from "./data-table"

export default function ProjectApplicationManagement() {
    const { user } = useUser()
    const router = useRouter()
    const [applications, setApplications] = useState<ProjectApplication[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!user) return
        const fetchApplications = async () => {
            try {
                const fetchRes = await getProjectAppByCom(user.id)
                if (fetchRes.success) {
                    console.log(fetchRes.data);
                    setApplications(fetchRes.data)
                } else {
                    toast.error("Failed to fetch project applications. Please try again")
                }
            } finally {
                setIsLoading(false)
            }
        }
        fetchApplications()
    }, [user])

    const stats = [
        { label: "Total", value: applications.length, icon: Users, color: "bg-slate-100 text-slate-500" },
        { label: "Pending", value: applications.filter(a => a.application_status === "pending").length, icon: Clock, color: "bg-yellow-100 text-yellow-600" },
        { label: "Shortlisted", value: applications.filter(a => a.application_status === "shortlisted").length, icon: FileText, color: "bg-purple-100 text-purple-600" },
        { label: "Accepted", value: applications.filter(a => a.application_status === "accepted").length, icon: CheckCircle2, color: "bg-green-100 text-green-600" },
        { label: "Rejected", value: applications.filter(a => a.application_status === "rejected").length, icon: XCircle, color: "bg-red-100 text-red-600" },
    ]

    const columns = getColumns((application) => {
        router.push(`/project-listings/view/${application.listing_id}/applications/${application.application_id}`)
    })

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Project Applications</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Stats */}
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {stats.map((stat) => {
                            const Icon = stat.icon
                            return (
                                <Card key={stat.label} className="rounded-lg border border-slate-200 shadow-sm">
                                    <CardContent className="px-5 flex flex-col gap-2">
                                        <p className="text-xs text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        <div className={`w-fit flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${stat.color}`}>
                                            <Icon size={11} />
                                            <span>{stat.label}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}

                {/* Table */}
                {isLoading ? (
                    <Card className="rounded-lg border border-slate-200 shadow-sm">
                        <CardHeader className="px-5 border-b border-grey-300">
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-5 w-40 rounded" />
                                <Skeleton className="h-4 w-64 rounded" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-5 py-3">
                            <div className="flex flex-col gap-3 py-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="rounded-lg border border-slate-200 shadow-sm">
                        <CardHeader className="px-5 border-b border-grey-300">
                            <CardTitle className="text-base font-semibold text-[#0f172a]">Project Applications</CardTitle>
                            <CardDescription>
                                All applications received across your project listings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-5 py-3">
                            <DataTable
                                columns={columns}
                                data={applications}
                                searchPlaceholder="Search applicants or projects..."
                                emptyIcon={<FileText size={32} className="text-slate-200" />}
                                emptyTitle="No project applications yet"
                                emptyDescription="Applications will appear here once candidates start applying"
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}