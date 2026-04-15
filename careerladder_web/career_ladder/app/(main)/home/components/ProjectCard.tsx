import { format } from "date-fns"
import { Project } from "@/types"
import { Building2, DollarSign, Clock, Users, FolderKanban } from "lucide-react"

interface ProjectCardProps {
    project: Project & { company_name?: string }
    onClick: () => void
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
    const allowance = parseFloat(project.allowance)
    const hasAllowance = !isNaN(allowance) && allowance > 0
    const startDate = project.start_date ? format(new Date(project.start_date), "MMM d") : null
    const endDate = project.end_date ? format(new Date(project.end_date), "MMM d, yyyy") : null

    return (
        <div
            onClick={onClick}
            className="group relative bg-white rounded-2xl border border-slate-200 hover:border-violet-200 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
        >
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

            <div className="p-5 flex flex-col gap-3.5">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-violet-600 transition-colors">
                            {project.title}
                        </h3>
                        {project.company_name && (
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                <Building2 size={10} /> {project.company_name}
                            </p>
                        )}
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0 group-hover:bg-violet-100 transition-colors">
                        <FolderKanban size={13} className="text-violet-500" />
                    </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{project.description}</p>

                {/* Footer meta */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2 border-t border-slate-100">
                    {hasAllowance && (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <DollarSign size={10} /> RM {allowance.toLocaleString()} / mo
                        </span>
                    )}
                    {startDate && endDate && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock size={10} className="text-slate-300" /> {startDate} – {endDate}
                        </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
                        <Users size={10} /> {project.vacancies} {project.vacancies === 1 ? "spot" : "spots"}
                    </span>
                </div>
            </div>
        </div>
    )
}
