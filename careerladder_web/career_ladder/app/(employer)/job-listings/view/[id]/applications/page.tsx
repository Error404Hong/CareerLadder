"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { getJobApplicationsById } from "@/app/api/job"
import { Application } from "@/types"

import { toast } from "sonner"
import { Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

import { DataTable } from "./data-table"
import { getColumns } from "./columns"

export default function ViewApplications() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [applicationData, setApplicationData] = useState<Application[]>([])

    useEffect(() => {
        const getApplications = async () => {
            try {
                const fetchRes = await getJobApplicationsById(id)
                if (fetchRes.success) {
                    console.log("data", fetchRes.data);
                    setApplicationData(fetchRes.data)
                } else {
                    toast.error("Failed to fetch applications. Please try again")
                }
            } finally {
                setIsLoading(false)
            }
        }
        getApplications()
    }, [id])

    const columns = getColumns((application) => {
        console.log("View application: ", application)
        router.push(`/job-listings/view/${id}/applications/${application.id}`)
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
                            <BreadcrumbLink href="/job-listings">Job Listings</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/job-listings/view/${id}`}>View Job</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Applications</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {isLoading ? (
                    <Card className="rounded-lg border border-slate-200 shadow-sm">
                        <CardHeader className="px-5 border-b border-grey-300">
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-5 w-40 rounded" />
                                <Skeleton className="h-4 w-64 rounded" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 py-3">
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
                            <CardTitle className="text-base font-semibold text-[#0f172a]">Job Applications</CardTitle>
                            <CardDescription>
                                {applicationData.length} application{applicationData.length !== 1 ? "s" : ""} received for this position
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 py-3">
                            <DataTable
                                columns={columns}
                                data={applicationData}
                                searchPlaceholder="Search applicants..."
                                emptyIcon={<Users size={32} className="text-slate-200" />}
                                emptyTitle="No applications yet"
                                emptyDescription="Applications will appear here once candidates start applying"
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}