import { format } from "date-fns"
import { Project } from "@/types"
import { Users, DollarSign, Clock, ChevronRight, FolderKanban } from "lucide-react"

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        open: "bg-emerald-50 text-emerald-600 border-emerald-200",
        active: "bg-emerald-50 text-emerald-600 border-emerald-200",
        closed: "bg-slate-100 text-slate-500 border-slate-200",
        completed: "bg-blue-50 text-blue-600 border-blue-200",
        ongoing: "bg-indigo-50 text-indigo-600 border-indigo-200",
    }
    const cls = map[status?.toLowerCase()] ?? "bg-slate-100 text-slate-500 border-slate-200"
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide border ${cls}`}>
            {status}
        </span>
    )
}

function ProjectCard({ project }: { project: Project }) {
    const allowance = parseFloat(project.allowance)
    const startDate = project.start_date ? format(new Date(project.start_date), "MMM d, yyyy") : null
    const endDate = project.end_date ? format(new Date(project.end_date), "MMM d, yyyy") : null

    return (
        <a href="/projects">
            <div className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200 p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-800 leading-snug">{project.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <StatusBadge status={project.status} />
                            <span className="text-xs font-medium uppercase tracking-wide text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                {project.duration}
                            </span>
                        </div>
                    </div>
                    <ChevronRight size={15} className="text-slate-300 shrink-0 mt-1" />
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{project.description}</p>

                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {allowance > 0 && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <DollarSign size={11} className="text-slate-400" /> RM {allowance.toLocaleString()} / month
                        </span>
                    )}
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Users size={11} className="text-slate-400" /> {project.vacancies} {project.vacancies === 1 ? "vacancy" : "vacancies"}
                    </span>
                    {startDate && endDate && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock size={11} className="text-slate-400" /> {startDate} – {endDate}
                        </span>
                    )}
                </div>
            </div>
        </a>
    )
}

interface ProjectsTabProps {
    projects: Project[]
}

export function ProjectsTab({ projects }: ProjectsTabProps) {
    const openProjects = projects.filter((p) => p.status?.toLowerCase() === "open")

    if (openProjects.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3 py-20">
                <FolderKanban size={28} className="text-slate-200" />
                <p className="text-sm text-slate-400">No open projects available for this company.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {openProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
    )
}
