"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { getJobApplications } from "@/app/api/job"
import { getProjectApplications } from "@/app/api/project"
import { toast } from "sonner"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Briefcase, FileText } from "lucide-react"
import { DataTable } from "./components/DataTable"
import { jobColumns, type JobApplication } from "./columns/jobColumns"
import { projectColumns, type ProjectApplication } from "./columns/projectColumn"

const STATUS_PILLS = [
    { value: "all",         label: "All" },
    { value: "pending",     label: "Pending" },
    { value: "reviewed",    label: "Reviewed" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "accepted",    label: "Accepted" },
    { value: "rejected",    label: "Rejected" },
]

function StatusFilter({
    value,
    onChange,
    jobApps,
    projectApps,
    activeTab,
}: {
    value: string
    onChange: (v: string) => void
    jobApps: JobApplication[]
    projectApps: ProjectApplication[]
    activeTab: string
}) {
    const apps = activeTab === "jobs" ? jobApps : projectApps

    const count = (status: string) =>
        status === "all" ? apps.length : apps.filter(a => a.application_status === status).length

    return (
        <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-1 w-fit flex-wrap">
            {STATUS_PILLS.map(pill => {
                const isActive = value === pill.value
                const n = count(pill.value)
                return (
                    <button
                        key={pill.value}
                        onClick={() => onChange(pill.value)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap
                            ${isActive
                                ? "bg-white text-[#0f172a] shadow-sm"
                                : "text-slate-500 hover:text-[#0f172a] hover:bg-white/60"
                            }`}
                    >
                        {pill.label}
                        <span className={`text-[11px] tabular-nums ${isActive ? "text-slate-400" : "text-slate-400"}`}>
                            {n}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}

export default function Applications() {
    const { user } = useUser()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [jobApplication, setJobApplication] = useState<JobApplication[]>([])
    const [projectApplication, setProjectApplication] = useState<ProjectApplication[]>([])
    const [statusFilter, setStatusFilter] = useState("all")

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

    const job_columns = jobColumns((jApplication) => {
        router.push(`/applications/jobs/${jApplication.listing_id}`)
    })

    const project_columns = projectColumns((pApplication) => {
        router.push(`/applications/projects/${pApplication.listing_id}`)
    })

    const filteredJobApps = statusFilter === "all"
        ? jobApplication
        : jobApplication.filter(a => a.application_status === statusFilter)

    const filteredProjectApps = statusFilter === "all"
        ? projectApplication
        : projectApplication.filter(a => a.application_status === statusFilter)

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/home">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink>Applications</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Track Application Status</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div>
                        <h1 className="text-xl font-bold">My Applications</h1>
                        <p className="text-sm text-slate-400 mt-1">
                            {isLoading
                                ? "Loading..."
                                : `${jobApplication.length + projectApplication.length} total application${jobApplication.length + projectApplication.length !== 1 ? "s" : ""}`
                            }
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <Tabs defaultValue="jobs" onValueChange={() => setStatusFilter("all")}>
                    <TabsList className="mb-6" variant="line">
                        <TabsTrigger value="jobs" className="gap-2 p-4 bg-gray-200 cursor-pointer">
                            <Briefcase size={13} />
                            Jobs
                            <Badge className="ml-1 text-[11px] bg-slate-100 text-slate-500 border border-slate-200 rounded-full px-2 py-0">
                                {jobApplication.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="projects" className="gap-2 p-4 bg-gray-200 cursor-pointer">
                            <FileText size={13} />
                            Projects
                            <Badge className="ml-1 text-[11px] bg-slate-100 text-slate-500 border border-slate-200 rounded-full px-2 py-0">
                                {projectApplication.length}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="jobs">
                        <Card className="rounded-2xl border border-slate-100 shadow-md">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-[#0f172a]">Job Applications</CardTitle>
                                        <CardDescription className="mt-1">Track and manage your job applications and their current status.</CardDescription>
                                    </div>
                                    <StatusFilter
                                        value={statusFilter}
                                        onChange={setStatusFilter}
                                        jobApps={jobApplication}
                                        projectApps={projectApplication}
                                        activeTab="jobs"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 pt-0">
                                {isLoading ? (
                                    <div className="flex flex-col gap-3">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Skeleton key={i} className="h-10 w-full rounded-xl" />
                                        ))}
                                    </div>
                                ) : (
                                    <DataTable
                                        columns={job_columns}
                                        data={filteredJobApps}
                                        searchPlaceholder="Search jobs..."
                                        emptyIcon={<Briefcase size={32} className="text-slate-200" />}
                                        emptyTitle={statusFilter !== "all" ? `No ${statusFilter} job applications` : "No job applications yet"}
                                        emptyDescription={statusFilter !== "all" ? "Try selecting a different status" : "Start applying for jobs to track them here"}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="projects">
                        <Card className="rounded-2xl border border-slate-100 shadow-md">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-[#0f172a]">Project Applications</CardTitle>
                                        <CardDescription className="mt-1">Monitor your project applications and collaboration opportunities.</CardDescription>
                                    </div>
                                    <StatusFilter
                                        value={statusFilter}
                                        onChange={setStatusFilter}
                                        jobApps={jobApplication}
                                        projectApps={projectApplication}
                                        activeTab="projects"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 pt-0">
                                {isLoading ? (
                                    <div className="flex flex-col gap-2">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Skeleton key={i} className="h-10 w-full rounded-xl" />
                                        ))}
                                    </div>
                                ) : (
                                    <DataTable
                                        columns={project_columns}
                                        data={filteredProjectApps}
                                        searchPlaceholder="Search projects..."
                                        emptyIcon={<FileText size={32} className="text-slate-200" />}
                                        emptyTitle={statusFilter !== "all" ? `No ${statusFilter} project applications` : "No project applications yet"}
                                        emptyDescription={statusFilter !== "all" ? "Try selecting a different status" : "Start applying for projects to track them here"}
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
