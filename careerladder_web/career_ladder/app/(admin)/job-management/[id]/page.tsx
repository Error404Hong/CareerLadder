"use client"

import { Job, JobApplication } from "@/types"
import { getJobById, getJobApplicationsById } from "@/app/api/job"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import { JobHeader } from "./components/JobHeader"
import { DetailsTab } from "./components/DetailsTab"
import { ApplicantsTab } from "./components/ApplicantsTab"

export default function JobDetailsPage() {
    const params = useParams()
    const jobId = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [job, setJob] = useState<Job | null>(null)
    const [applications, setApplications] = useState<JobApplication[]>([])

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const [jobRes, appRes] = await Promise.all([
                    getJobById(jobId),
                    getJobApplicationsById(jobId),
                ])
                if (jobRes.success) setJob(jobRes.data)
                if (appRes.success) setApplications(appRes.data ?? [])
            } catch {
                toast.error("Something went wrong. Please try again")
            } finally {
                setIsLoading(false)
            }
        }
        fetchJobDetails()
    }, [jobId])

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink href="/admin-dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbLink href="/job-management">Job Management</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage>Job Details</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {isLoading ? (
                    <div className="flex flex-col gap-5">
                        <Card className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="h-2 w-full bg-slate-200" />
                            <CardContent className="px-6 py-5 flex flex-col gap-3">
                                <Skeleton className="h-7 w-64 rounded" />
                                <Skeleton className="h-4 w-48 rounded" />
                                <div className="flex gap-2 mt-1">
                                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-7 w-24 rounded-full" />)}
                                </div>
                            </CardContent>
                        </Card>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            <div className="lg:col-span-2 flex flex-col gap-5">
                                {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
                            </div>
                            <div className="flex flex-col gap-5">
                                <Skeleton className="h-56 w-full rounded-xl" />
                                <Skeleton className="h-28 w-full rounded-xl" />
                            </div>
                        </div>
                    </div>
                ) : job ? (
                    <>
                        <JobHeader job={job} />

                        <Tabs defaultValue="details">
                            <TabsList variant="line" className="mb-2">
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="applicants">
                                    Applicants
                                    {applications.length > 0 && (
                                        <span className="ml-1.5 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{applications.length}</span>
                                    )}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="details">
                                <DetailsTab job={job} />
                            </TabsContent>

                            <TabsContent value="applicants">
                                <ApplicantsTab applications={applications} />
                            </TabsContent>
                        </Tabs>
                    </>
                ) : (
                    <Card className="rounded-xl border border-slate-200 shadow-sm">
                        <CardContent className="px-6 py-16 text-center">
                            <p className="text-sm text-slate-400">Job not found</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
