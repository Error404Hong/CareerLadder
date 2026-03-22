"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { getJobById } from "@/app/api/job"
import { Job } from "@/types"

import { toast } from "sonner"
import { Pencil, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

export default function ViewJob() {
    const params = useParams()
    const id = params.id as string
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true)
    const [jobData, setJobData] = useState<Job | null>(null)

    useEffect(() => {
        const getJob = async () => {
            try {
                const fetchRes = await getJobById(id)
                if (fetchRes.success) {
                    console.log(fetchRes.data)
                    setJobData(fetchRes.data)

                } else {
                    toast.error("Failed to fetch job. Please try again")
                }
            } finally {
                setIsLoading(false)
            }
        }
        getJob()
    }, [id])

    if (isLoading) return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">
                <Skeleton className="h-4 w-64 rounded" />
                <div className="flex flex-col gap-5">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                </div>
            </div>
        </div>
    )

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
                            <BreadcrumbPage>View Job — {jobData?.title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-xl font-bold  tracking-tight">{jobData?.title}</h1>
                        <p className="text-sm text-slate-400 mt-1">Posted on {new Date(jobData?.created_at ?? "").toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="cursor-pointer rounded-full gap-1.5 p-5"
                            onClick={() => router.push(`/job-listings/edit/${id}`)}>
                            <Pencil size={13} /> Edit Job
                        </Button>
                        <Button className="cursor-pointer rounded-full gap-1.5 p-5"
                            onClick={() => router.push(`/job-listings/view/${id}/applications`)}>
                            <Users size={13} /> View Applications
                            <Badge className="ml-1 bg-white/20 text-white text-[11px] px-2 py-0 rounded-full">
                                {Number(jobData?.application_count) ?? 0}
                            </Badge>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Left — Main Details */}
                    <div className="lg:col-span-2 flex flex-col gap-5">

                        {/* Description */}
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-grey-300">
                                <CardTitle className="text-base font-semibold ">Job Description</CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 py-3">
                                <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">{jobData?.description}</p>
                            </CardContent>
                        </Card>

                        {/* Requirements */}
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-grey-300">
                                <CardTitle className="text-base font-semibold ">Requirements</CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 py-3">
                                <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">{jobData?.requirements}</p>
                            </CardContent>
                        </Card>

                        {/* Skills */}
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-grey-300">
                                <CardTitle className="text-base font-semibold ">Skills Required</CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 py-3">
                                <div className="flex flex-wrap gap-2">
                                    {jobData?.skills_required.map((skill) => (
                                        <Badge key={skill} variant="secondary" className="px-3 py-1.5 text-sm">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right — Info */}
                    <div className="flex flex-col gap-5">

                        {/* Status */}
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-grey-300">
                                <CardTitle className="text-base font-semibold ">Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 py-3 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Status</span>
                                    <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${jobData?.status === "open" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-600 border border-red-200"}`}>
                                        {jobData?.status === "open" ? "Open" : "Closed"}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Type</span>
                                    <span className="text-sm font-medium  capitalize">{jobData?.employment_type}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Location</span>
                                    <span className="text-sm font-medium ">{jobData?.location}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Remote</span>
                                    <span className="text-sm font-medium ">{jobData?.is_remote ? "Yes" : "No"}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Vacancies</span>
                                    <span className="text-sm font-medium ">{jobData?.vacancies}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Applications</span>
                                    <span className="text-sm font-medium ">{Number(jobData?.application_count)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Salary */}
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-grey-300">
                                <CardTitle className="text-base font-semibold ">Salary Range</CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 py-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-center">
                                        <p className="text-xs text-slate-400 mb-1">Minimum</p>
                                        <p className="text-lg font-bold ">RM {Number(jobData?.salary_min).toLocaleString()}</p>
                                    </div>
                                    <div className="text-slate-300 text-lg">—</div>
                                    <div className="text-center">
                                        <p className="text-xs text-slate-400 mb-1">Maximum</p>
                                        <p className="text-lg font-bold ">RM {Number(jobData?.salary_max).toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )

}