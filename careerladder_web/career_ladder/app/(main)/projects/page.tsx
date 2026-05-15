"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { getAllProjects } from "@/app/api/project"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Briefcase, Search, Sparkles, Loader2, X } from "lucide-react"

import { ProjectCard, type Project } from "./components/ProjectCard"
import { ProjectCardSkeleton } from "./components/ProjectCardSkeleton"
import { useRecommendations } from "@/hooks/useRecommendations"

const ITEMS_PER_PAGE = 6

function buildPageNumbers(current: number, total: number) {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
    if (current <= 3) return [1, 2, 3, 4, "...", total]
    if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total]
    return [1, "...", current - 1, current, current + 1, "...", total]
}

function ProjectsContent() {
    const searchParams = useSearchParams()
    const [projectList, setProjectList] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState(searchParams.get("search") ?? "")
    const [durationFilter, setDurationFilter] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [showAIPicks, setShowAIPicks] = useState(false)

    const { recommendations, isLoading: aiLoading, refresh: refreshAI } = useRecommendations(
        [], projectList, [], { autoFetch: false }
    )
    const aiProjects = (showAIPicks && recommendations)
        ? projectList.filter(p => recommendations.recommendedProjectIds.includes(p.id)).slice(0, 3)
        : []

    const hasActiveFilters = search !== "" || durationFilter !== "all" || showAIPicks

    const clearFilters = () => {
        setSearch("")
        setDurationFilter("all")
        setShowAIPicks(false)
        setCurrentPage(1)
    }

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const projects = await getAllProjects()
                if (projects.success) {
                    const filtered = projects.data.filter((e: Project) => e.status === "open")
                    setProjectList(filtered)
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

    useEffect(() => { setCurrentPage(1) }, [search, durationFilter])

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Header */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-6">

                    {/* Breadcrumb */}
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/home" >Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink >Opportunities</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Project Listings</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex items-end justify-between gap-6 flex-wrap">
                        <div>
                            <h1 className="text-xl font-bold">Project Listings</h1>
                            <p className="text-sm text-slate-400 mt-1">
                                Explore projects available for collaboration and contribution
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
                                    className="flex-1 text-sm bg-transparent outline-none text-slate-600 placeholder:text-slate-400"
                                />
                            </div>
                            <Select value={durationFilter} onValueChange={setDurationFilter}>
                                <SelectTrigger className="h-9 w-36 text-sm rounded-xl border-slate-200">
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
                            <button
                                onClick={() => { refreshAI(); setShowAIPicks(true) }}
                                disabled={aiLoading || loading}
                                className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-sm font-medium transition-colors disabled:opacity-60"
                            >
                                {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                                {aiLoading ? "Thinking..." : "AI Picks"}
                            </button>

                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 text-sm font-medium transition-colors cursor-pointer"
                                >
                                    <X size={13} />
                                    Clear filters
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
                    </div>
                ) : aiProjects.length > 0 ? (
                    <>
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles size={13} className="text-indigo-500" />
                            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">AI Picks for You</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {aiProjects.map(project => <ProjectCard key={project.id} project={project} aiPick />)}
                        </div>
                    </>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <Briefcase size={36} className="text-slate-200" />
                        <p className="text-sm text-slate-400">No projects found</p>
                        <p className="text-sm text-slate-400">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {paginated.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)) }}
                                                className={currentPage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                                            />
                                        </PaginationItem>

                                        {buildPageNumbers(currentPage, totalPages).map((page, idx) =>
                                            page === "..." ? (
                                                <PaginationItem key={`ellipsis-${idx}`}>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            ) : (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        href="#"
                                                        isActive={currentPage === page}
                                                        onClick={(e) => { e.preventDefault(); setCurrentPage(page as number) }}
                                                        className="cursor-pointer"
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            )
                                        )}

                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)) }}
                                                className={currentPage === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default function Projects() {
    return (
        <Suspense>
            <ProjectsContent />
        </Suspense>
    )
}
