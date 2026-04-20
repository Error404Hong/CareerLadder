import { Project } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { FolderKanban, CalendarDays, Users, DollarSign, Clock } from "lucide-react"

const statusConfig: Record<string, { label: string; className: string }> = {
    open:        { label: "Open",        className: "bg-green-100 text-green-700 border border-green-200" },
    closed:      { label: "Closed",      className: "bg-red-100 text-red-600 border border-red-200" },
    in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-700 border border-blue-200" },
    completed:   { label: "Completed",   className: "bg-slate-100 text-slate-600 border border-slate-200" },
}

export function ProjectHeader({ project }: { project: Project }) {
    const status = statusConfig[project.status] ?? { label: project.status, className: "bg-slate-100 text-slate-500 border border-slate-200" }

    return (
        <Card className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-2 w-full bg-linear-to-r from-violet-500 via-[#2563eb] to-violet-500" />
            <CardContent className="px-6 py-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                            <FolderKanban size={20} className="text-violet-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-[#0f172a]">{project.title}</h1>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                    <CalendarDays size={11} />
                                    Posted {new Date(project.created_at).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
                                </span>
                                {project.updated_at !== project.created_at && (
                                    <span className="text-xs text-slate-300">
                                        · Updated {new Date(project.updated_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <span className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${status.className}`}>
                        {status.label}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                        <Clock size={12} /> {project.duration}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                        <Users size={12} /> {project.vacancies} {project.vacancies === 1 ? "vacancy" : "vacancies"}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                        <CalendarDays size={12} />
                        {new Date(project.start_date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                        {" — "}
                        {new Date(project.end_date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full">
                        <DollarSign size={12} /> RM {Number(project.allowance).toLocaleString()} / month
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
