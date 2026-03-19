"use client"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { getJobApplications } from "@/app/api/job"
import { getProjectApplications } from "@/app/api/project"
import { toast } from "sonner"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, FileText } from "lucide-react"
import { DataTable } from "./components/DataTable"
import { jobColumns, type JobApplication } from "./columns/jobColumns"
import { projectColumns, type ProjectApplication } from "./columns/projectColumn"


export default function Applications() {
    const { user } = useUser()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [jobApplication, setJobApplication] = useState<JobApplication[]>([])
    const [projectApplication, setProjectApplication] = useState<ProjectApplication[]>([])

    useEffect(() => {
        if (!user) return

        const getApplications = async () => {
            try {
                const projectRes = await getProjectApplications(user.id)
                const jobRes = await getJobApplications(user.id)

                if (projectRes.success && jobRes.success) {
                    setJobApplication(jobRes.data)
                    setProjectApplication(projectRes.data)
                } else {
                    toast.error("Failed to fetch applications.")
                }
            } catch (error) {
                toast.error("Something went wrong. Please try again");
                throw error;
            } finally {
                setIsLoading(false)
            }
        }

        getApplications()
    }, [user])

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/home" className="text-sm text-slate-400 hover:text-[#0f172a]">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink className="text-sm text-slate-400 hover:text-[#0f172a]">Applications</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-sm text-[#0f172a] font-medium">Track Application Status</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex items-end justify-between gap-6 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">My Applications</h1>
                            <p className="text-sm text-slate-400 mt-1">
                                {isLoading ? "Loading..." : `${jobApplication.length + projectApplication.length} total application${jobApplication.length + projectApplication.length !== 1 ? "s" : ""}`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <Tabs defaultValue="jobs">
                    <TabsList className="mb-6">
                        <TabsTrigger value="jobs" className="gap-2 p-4 bg-gray-200">
                            <Briefcase size={13} />
                            Jobs
                            <Badge className="ml-1 text-[11px] bg-slate-100 text-slate-500 border border-slate-200 rounded-full px-2 py-0">
                                {jobApplication.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="projects" className="gap-2 p-4 bg-gray-200">
                            <FileText size={13} />
                            Projects
                            <Badge className="ml-1 text-[11px] bg-slate-00 text-slate-500 border border-slate-200 rounded-full px-2 py-0">
                                {projectApplication.length}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="jobs">
                        <Card className="rounded-2xl border border-slate-100 shadow-md">
                            <CardHeader >
                                <CardTitle className="text-lg font-semibold text-[#0f172a]">Job Applications</CardTitle>
                                <CardDescription>Track and manage your job applications and their current status.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                {isLoading ? (
                                    <div className="flex flex-col gap-3">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Skeleton key={i} className="h-10 w-full rounded-xl" />
                                        ))}
                                    </div>
                                ) : (
                                    <DataTable
                                        columns={jobColumns}
                                        data={jobApplication}
                                        searchPlaceholder="Search jobs..."
                                        emptyIcon={<Briefcase size={32} className="text-slate-200" />}
                                        emptyTitle="No job applications yet"
                                        emptyDescription="Start applying for jobs to track them here"
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="projects">
                        <Card className="rounded-2xl border border-slate-100 shadow-md">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-[#0f172a]">Project Applications</CardTitle>
                                <CardDescription>Monitor your project applications and collaboration opportunities.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                {isLoading ? (
                                    <div className="flex flex-col gap-2">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Skeleton key={i} className="h-10 w-full rounded-xl" />
                                        ))}
                                    </div>
                                ) : (
                                    <DataTable
                                        columns={projectColumns}
                                        data={projectApplication}
                                        searchPlaceholder="Search projects..."
                                        emptyIcon={<FileText size={32} className="text-slate-200" />}
                                        emptyTitle="No project applications yet"
                                        emptyDescription="Start applying for projects to track them here"
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}