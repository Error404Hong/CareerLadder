"use client"

import { Job } from "@/types"
import { getAllJobs } from "@/app/api/job"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Briefcase, CheckCircle2, XCircle, FileDown } from "lucide-react"
import { generatePDFReport } from "@/lib/generate-report"
import { DataTable } from "./data-table"
import { getJobColumns } from "./job-columns"
import { DeleteJobDialog } from "./components/DeleteJobDialog"

function StatCard({
    icon: Icon,
    label,
    value,
    iconClass,
    iconBg,
}: {
    icon: React.ElementType
    label: string
    value: number | string
    iconClass: string
    iconBg: string
}) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon size={18} className={iconClass} />
            </div>
            <div>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
                <p className="text-2xl font-bold text-[#0f172a] leading-tight">{value}</p>
            </div>
        </div>
    )
}

export default function JobManagementPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [jobs, setJobs] = useState<Job[]>([])

    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                const jobRes = await getAllJobs()
                if (jobRes.success) {
                    setJobs(jobRes.data ?? [])
                } else {
                    toast.error("Failed to fetch jobs. Please try again.")
                }
            } catch {
                toast.error("Something went wrong. Please try again")
            } finally {
                setIsLoading(false)
            }
        }
        fetchAllJobs()
    }, [])

    const [deletingJob, setDeletingJob] = useState<Job | null>(null)

    const jobColumns = getJobColumns(
        (id) => router.push(`/job-management/${id}`),
        (job) => setDeletingJob(job)
    )

    const openJobs = jobs.filter((j) => j.status === "open").length
    const closedJobs = jobs.filter((j) => j.status === "closed").length

    const handleGenerateReport = () => {
        generatePDFReport({
            title: "Job Listings Report",
            subtitle: "All job listings across companies",
            stats: [
                { label: "Total Jobs", value: jobs.length },
                { label: "Open", value: openJobs },
                { label: "Closed", value: closedJobs },
            ],
            tables: [{
                head: ["Title", "Type", "Location", "Salary (RM)", "Status", "Posted", "Applications"],
                body: jobs.map(j => [
                    j.title,
                    j.employment_type,
                    j.is_remote ? "Remote" : j.location,
                    `${Number(j.salary_min).toLocaleString()} – ${Number(j.salary_max).toLocaleString()}`,
                    j.status.charAt(0).toUpperCase() + j.status.slice(1),
                    new Date(j.created_at).toLocaleDateString("en-MY"),
                    j.application_count ?? 0,
                ]),
            }],
        })
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin-dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Job Management</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {isLoading ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="rounded-xl border border-slate-200 bg-white px-5 py-4 flex items-center gap-4">
                                    <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                                    <div className="flex flex-col gap-1.5 flex-1">
                                        <Skeleton className="h-3 w-16 rounded" />
                                        <Skeleton className="h-6 w-10 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-slate-200">
                                <div className="flex flex-col gap-2">
                                    <Skeleton className="h-6 w-32 rounded" />
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
                    </>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <StatCard icon={Briefcase} label="Total Jobs" value={jobs.length} iconBg="bg-blue-50" iconClass="text-[#2563eb]" />
                            <StatCard icon={CheckCircle2} label="Open" value={openJobs} iconBg="bg-green-50" iconClass="text-green-600" />
                            <StatCard icon={XCircle} label="Closed" value={closedJobs} iconBg="bg-red-50" iconClass="text-red-500" />
                        </div>

                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-slate-100">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-xl font-bold">Job Listings</CardTitle>
                                        <CardDescription>View and monitor all job listings across companies</CardDescription>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5 shrink-0 cursor-pointer"
                                        onClick={handleGenerateReport}
                                        disabled={jobs.length === 0}
                                    >
                                        <FileDown size={14} />
                                        Export PDF
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="px-5 py-4">
                                <DataTable
                                    columns={jobColumns}
                                    data={jobs}
                                    searchPlaceholder="Search jobs..."
                                    emptyTitle="No jobs found"
                                    emptyIcon={<Briefcase size={32} className="text-slate-200" />}
                                />
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            <DeleteJobDialog
                job={deletingJob}
                onClose={() => setDeletingJob(null)}
                onDeleted={(id) => setJobs((prev) => prev.filter((j) => j.id !== id))}
            />
        </div>
    )
}
