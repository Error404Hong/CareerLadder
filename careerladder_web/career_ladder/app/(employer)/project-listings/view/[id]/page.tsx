"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { getProjectById } from "@/app/api/project"
import { Project } from "@/types/project"

import { toast } from "sonner"
import { Pencil, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

export default function ViewProject() {
    const params = useParams()
    const id = params.id as string
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(true)
    const [projectData, setProjectData] = useState<Project | null>(null)

    useEffect(() => {
        const getProject = async () => {
            try {
                const fetchRes = await getProjectById(id)
                if (fetchRes.success) {
                    setProjectData(fetchRes.data)
                } else {
                    toast.error("Failed to fetch project. Please try again")
                }
            } catch {
                toast.error("Something went wrong. Please try again")
            } finally {
                setIsLoading(false)
            }
        }
        getProject()
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
                            <BreadcrumbLink href="/project-listings">Project Listings</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>View Project — {projectData?.title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">{projectData?.title}</h1>
                        <p className="text-sm text-slate-400 mt-1">Posted on {new Date(projectData?.created_at ?? "").toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="cursor-pointer rounded-full gap-1.5 p-5"
                            onClick={() => router.push(`/project-listings/edit/${id}`)}>
                            <Pencil size={13} /> Edit Project
                        </Button>
                        <Button className="cursor-pointer rounded-full gap-1.5 p-5"
                            onClick={() => router.push(`/project-listings/view/${id}/applications`)}>
                            <Users size={13} /> View Applications
                            <Badge className="ml-1 bg-white/20 text-white text-[11px] px-2 py-0 rounded-full">
                                {Number(projectData?.application_count) ?? 0}
                            </Badge>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Left — Main Details */}
                    {/* Left — Main Details */}
                    <div className="lg:col-span-2 flex flex-col gap-5">

                        {/* Description */}
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-grey-300">
                                <CardTitle className="text-base font-semibold">Project Description</CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 py-3">
                                <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">{projectData?.description}</p>
                            </CardContent>
                        </Card>

                        {/* Skills + Allowance side by side */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Card className="rounded-lg border border-slate-200 shadow-sm">
                                <CardHeader className="px-5 border-b border-grey-300">
                                    <CardTitle className="text-base font-semibold">Monthly Allowance</CardTitle>
                                </CardHeader>
                                <CardContent className="px-6 py-3 flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">RM {Number(projectData?.allowance).toLocaleString()}</p>
                                        <p className="text-xs text-slate-400 mt-1">per month</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-lg border border-slate-200 shadow-sm">
                                <CardHeader className="px-5 border-b border-grey-300">
                                    <CardTitle className="text-base font-semibold">Skills Required</CardTitle>
                                </CardHeader>
                                <CardContent className="px-6 py-3">
                                    <div className="flex flex-wrap gap-2">
                                        {projectData?.skills_required.map((skill) => (
                                            <Badge key={skill} variant="secondary" className="px-3 py-1.5 text-sm">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right — Info */}
                    <div className="flex flex-col gap-5">

                        {/* Overview */}
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-grey-300">
                                <CardTitle className="text-base font-semibold">Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 py-3 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Status</span>
                                    <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${projectData?.status === "open" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-600 border border-red-200"}`}>
                                        {projectData?.status === "open" ? "Open" : "Closed"}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Duration</span>
                                    <span className="text-sm font-medium">{projectData?.duration}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Vacancies</span>
                                    <span className="text-sm font-medium">{projectData?.vacancies}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Applications</span>
                                    <span className="text-sm font-medium">{Number(projectData?.application_count)}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Start Date</span>
                                    <span className="text-sm font-medium">
                                        {projectData?.start_date && new Date(projectData.start_date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">End Date</span>
                                    <span className="text-sm font-medium">
                                        {projectData?.end_date && new Date(projectData.end_date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}