"use client"

import { Project } from "@/types"
import { getAllProjects } from "@/app/api/project"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { FolderKanban, CheckCircle2, XCircle } from "lucide-react"
import { DataTable } from "./data-table"
import { getProjectColumns } from "./project-columns"
import { DeleteProjectDialog } from "./components/DeleteProjectDialog"

function StatCard({
    icon: Icon, label, value, iconClass, iconBg,
}: {
    icon: React.ElementType; label: string; value: number | string; iconClass: string; iconBg: string
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

export default function ProjectManagementPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [projects, setProjects] = useState<Project[]>([])
    const [deletingProject, setDeletingProject] = useState<Project | null>(null)

    useEffect(() => {
        const fetchAllProjects = async () => {
            try {
                const fetchRes = await getAllProjects()
                if (fetchRes.success) setProjects(fetchRes.data ?? [])
                else toast.error("Failed to fetch projects. Please try again.")
            } catch {
                toast.error("Something went wrong. Please try again")
            } finally {
                setIsLoading(false)
            }
        }
        fetchAllProjects()
    }, [])

    const projectColumns = getProjectColumns(
        (id) => router.push(`/project-management/${id}`),
        (project) => setDeletingProject(project)
    )

    const openProjects = projects.filter((p) => p.status === "open").length
    const closedProjects = projects.filter((p) => p.status === "closed").length
    const inProgressProjects = projects.filter((p) => p.status === "in_progress").length

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
                            <BreadcrumbPage>Project Management</BreadcrumbPage>
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
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <StatCard icon={FolderKanban} label="Total Projects" value={projects.length} iconBg="bg-blue-50" iconClass="text-[#2563eb]" />
                            <StatCard icon={CheckCircle2} label="Open" value={openProjects} iconBg="bg-green-50" iconClass="text-green-600" />
                            <StatCard icon={FolderKanban} label="In Progress" value={inProgressProjects} iconBg="bg-violet-50" iconClass="text-violet-600" />
                            <StatCard icon={XCircle} label="Closed" value={closedProjects} iconBg="bg-red-50" iconClass="text-red-500" />
                        </div>

                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-slate-100">
                                <CardTitle className="text-xl font-bold">Project Listings</CardTitle>
                                <CardDescription>View and monitor all project listings across companies</CardDescription>
                            </CardHeader>
                            <CardContent className="px-5 py-4">
                                <DataTable
                                    columns={projectColumns}
                                    data={projects}
                                    searchPlaceholder="Search projects..."
                                    emptyTitle="No projects found"
                                    emptyIcon={<FolderKanban size={32} className="text-slate-200" />}
                                />
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            <DeleteProjectDialog
                project={deletingProject}
                onClose={() => setDeletingProject(null)}
                onDeleted={(id) => setProjects((prev) => prev.filter((p) => p.id !== id))}
            />
        </div>
    )
}
