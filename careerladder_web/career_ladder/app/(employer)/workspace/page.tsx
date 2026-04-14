"use client"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"

import { Project } from "@/types"
import { getCompanyProjects } from "@/app/api/project"

import { toast } from "sonner"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Briefcase } from "lucide-react"

import { ProjectCard } from "./project-card"
import { ProjectCardSkeleton } from "./project-card-skeleton"

export default function Workspace() {
    const { user } = useUser()

    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return
        const fetchProjects = async () => {
            try {
                const fetchRes = await getCompanyProjects(user.id)
                if (fetchRes.success) {
                    const filtered = fetchRes.data.filter((p: Project) => p.status === "in_progress" || p.status === "completed")
                    setProjects(filtered)
                } else {
                    toast.error("Failed to fetch projects")
                }
            } catch {
                toast.error("Something went wrong. Please try again")
            } finally {
                setLoading(false)
            }
        }

        fetchProjects()
    }, [user])

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
                            <BreadcrumbPage>Workspace</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="max-w-6xl mx-auto px-6 pb-8">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                        <Briefcase size={36} className="text-slate-200" />
                        <p className="text-sm text-slate-400">No active projects</p>
                        <p className="text-xs text-slate-300">Projects will appear here once all vacancies are filled</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
