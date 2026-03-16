"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { getAllProjects } from "@/app/api/project"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Briefcase, Search } from "lucide-react"

import { ProjectCard, type Project } from "./components/ProjectCard"
import { ProjectCardSkeleton } from "./components/ProjectCardSkeleton"

export default function Projects() {
    const [projectList, setProjectList] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [durationFilter, setDurationFilter] = useState("all")

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const projects = await getAllProjects()
                if (projects.success) {
                    setProjectList(projects.data)
                } else {
                    toast.error("Failed to fetch projects. Please reload page.")
                }
            } finally {
                setLoading(false)
            }
        }
        fetchProjects();
    }, [])

    const filtered = projectList
        .filter(p => p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase()))
        .filter(p => durationFilter === "all" || p.duration === durationFilter)

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Header */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-6">

                    {/* Breadcrumb */}
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/home" className="text-xs text-slate-400 hover:text-[#0f172a]">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink className="text-xs text-slate-400 hover:text-[#0f172a]">Opportunities</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-xs text-[#0f172a] font-medium">Project Listings</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex items-end justify-between gap-6 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Project Listings</h1>
                            <p className="text-sm text-slate-400 mt-1">
                                {loading ? "Loading..." : `${filtered.length} open project${filtered.length !== 1 ? "s" : ""} available`}
                            </p>
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 h-9 px-3 rounded-xl border border-slate-200 bg-white w-56">
                                <Search size={13} className="text-slate-400 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1 text-xs bg-transparent outline-none text-slate-600 placeholder:text-slate-400"
                                />
                            </div>
                            <Select value={durationFilter} onValueChange={setDurationFilter}>
                                <SelectTrigger className="h-9 w-36 text-xs rounded-xl border-slate-200">
                                    <SelectValue placeholder="Duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Durations</SelectItem>
                                    <SelectItem value="1 month">1 Month</SelectItem>
                                    <SelectItem value="2 months">2 Months</SelectItem>
                                    <SelectItem value="3 months">3 Months</SelectItem>
                                    <SelectItem value="4 months">4 Months</SelectItem>
                                    <SelectItem value="6 months">6 Months</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {Array.from({ length: 8 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <Briefcase size={36} className="text-slate-200" />
                        <p className="text-sm font-medium text-slate-400">No projects found</p>
                        <p className="text-sm text-slate-400">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filtered.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}