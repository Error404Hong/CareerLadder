"use client"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"

import { ProjectApplication } from "@/types"
import { getProjectApplications } from "@/app/api/project"

import { toast } from "sonner"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react"

const KANBAN_COLUMNS = [
    { id: "todo", label: "To Do", dot: "bg-slate-300" },
    { id: "in_progress", label: "In Progress", dot: "bg-blue-400" },
    { id: "review", label: "In Review", dot: "bg-amber-400" },
    { id: "done", label: "Done", dot: "bg-green-400" },
]

const PLACEHOLDER_TASKS: Record<string, { id: string; title: string; tag: string }[]> = {
    todo: [{ id: "t1", title: "Set up project environment", tag: "Setup" }],
    in_progress: [{ id: "t2", title: "Review project requirements", tag: "Planning" }],
    review: [],
    done: [],
}

function ProjectListSkeleton() {
    return (
        <div className="flex flex-col gap-2 p-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-3 rounded-xl border border-slate-100">
                    <Skeleton className="h-4 w-3/4" />
                </div>
            ))}
        </div>
    )
}

function KanbanBoardSkeleton() {
    return (
        <div className="flex gap-4 h-full">
            {KANBAN_COLUMNS.map((col) => (
                <div key={col.id} className="w-56 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                        <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                </div>
            ))}
        </div>
    )
}

function KanbanColumn({ column }: { column: typeof KANBAN_COLUMNS[0] }) {
    const cards = PLACEHOLDER_TASKS[column.id] ?? []

    return (
        <div className="w-56 flex flex-col shrink-0">
            <div className="flex items-center gap-2 mb-3">
                <div className={`w-2.5 h-2.5 rounded-full ${column.dot}`} />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{column.label}</span>
                <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-1.5 py-0.5 leading-none">{cards.length}</span>
            </div>

            <div className="flex flex-col gap-2">
                {cards.length === 0 ? (
                    <div className="w-full py-6 border border-dashed border-slate-200 rounded-xl text-xs text-slate-300 text-center">
                        No tasks
                    </div>
                ) : (
                    cards.map((card) => (
                        <div
                            key={card.id}
                            className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm"
                        >
                            <p className="text-sm font-medium text-slate-700 mb-2">{card.title}</p>
                            <Badge variant="secondary" className="text-xs">{card.tag}</Badge>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default function MyWorkspace() {
    const { user } = useUser()

    const [projects, setProjects] = useState<ProjectApplication[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(true)

    useEffect(() => {
        if (!user) return

        const getUserProjects = async () => {
            try {
                const res = await getProjectApplications(user.id)
                if (res.success) {
                    const accepted: ProjectApplication[] = res.data.filter(
                        (p: ProjectApplication) => p.application_status === "accepted"
                    )
                    setProjects(accepted)
                    if (accepted.length > 0) setSelectedId(accepted[0].application_id)
                } else {
                    toast.error("Failed to fetch projects.")
                }
            } catch {
                toast.error("Something went wrong. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        getUserProjects()
    }, [user])

    const selected = projects.find((p) => p.application_id === selectedId)

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/home">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>My Workspace</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <h1 className="text-xl font-bold">My Workspace</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Your hub for collaborating with companies, building projects, and gaining real experience.
                    </p>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 flex gap-4">

                {/* Left panel — collapsible */}
                <div className={`flex flex-col transition-all duration-300 ease-in-out self-start sticky top-6 ${sidebarOpen ? "w-[25%]" : "w-10"}`}>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        {/* Panel header with toggle */}
                        <div className={`flex items-center border-b border-slate-100 ${sidebarOpen ? "px-4 py-3 justify-between" : "px-2 py-3 justify-center"}`}>
                            {sidebarOpen && (
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-700">My Projects</p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {loading ? "Loading..." : `${projects.length} active project${projects.length !== 1 ? "s" : ""}`}
                                    </p>
                                </div>
                            )}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                            >
                                {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                            </button>
                        </div>

                        {/* Project list */}
                        {sidebarOpen && (
                            <div className="overflow-y-auto max-h-[calc(100vh-240px)]">
                                {loading ? (
                                    <ProjectListSkeleton />
                                ) : projects.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 gap-2 px-4 text-center">
                                        <Briefcase size={28} className="text-slate-200" />
                                        <p className="text-sm text-slate-400">No active projects</p>
                                        <p className="text-xs text-slate-300">Accepted applications will appear here</p>
                                    </div>
                                ) : (
                                    <div className="p-3 flex flex-col gap-1.5">
                                        {projects.map((app) => {
                                            const isActive = app.application_id === selectedId
                                            return (
                                                <button
                                                    key={app.application_id}
                                                    onClick={() => setSelectedId(app.application_id)}
                                                    className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                                                        isActive
                                                            ? "bg-slate-900 border-slate-900"
                                                            : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    <p className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-slate-700"}`}>
                                                        {app.title}
                                                    </p>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right panel */}
                <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex-1 p-6">
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-64 mb-8" />
                            <KanbanBoardSkeleton />
                        </div>
                    ) : !selected ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-8">
                            <Briefcase size={36} className="text-slate-200" />
                            <p className="text-sm text-slate-400">Select a project to view details</p>
                        </div>
                    ) : (
                        <>
                            {/* Project info bar */}
                            <div className="px-6 py-4 border-b border-slate-100">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div>
                                        <h2 className="text-base font-bold text-slate-800">{selected.title}</h2>
                                        <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">{selected.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {selected.skills_required?.slice(0, 3).map((skill) => (
                                            <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                                        ))}
                                        {(selected.skills_required?.length ?? 0) > 3 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{selected.skills_required.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 flex-wrap">
                                    <span>Start: <span className="text-slate-600 font-medium">{selected.start_date?.slice(0, 10)}</span></span>
                                    <span>End: <span className="text-slate-600 font-medium">{selected.end_date?.slice(0, 10)}</span></span>
                                    <span>Duration: <span className="text-slate-600 font-medium">{selected.duration}</span></span>
                                    {selected.allowance && (
                                        <span>Allowance: <span className="text-slate-600 font-medium">RM {selected.allowance}/mo</span></span>
                                    )}
                                </div>
                            </div>

                            {/* Kanban board */}
                            <div className="flex-1 overflow-x-auto p-6">
                                <div className="flex gap-4 min-w-max">
                                    {KANBAN_COLUMNS.map((col) => (
                                        <KanbanColumn key={col.id} column={col} />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
