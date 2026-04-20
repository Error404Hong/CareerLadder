import { Job } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, MapPin, Users, DollarSign, Globe, CalendarDays, FileText } from "lucide-react"

const statusConfig = {
    open:   { label: "Open",   className: "bg-green-100 text-green-700 border border-green-200" },
    closed: { label: "Closed", className: "bg-red-100 text-red-600 border border-red-200" },
}

export function JobHeader({ job }: { job: Job }) {
    const status = statusConfig[job.status as keyof typeof statusConfig]

    return (
        <Card className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-2 w-full bg-linear-to-r from-[#2563eb] via-violet-500 to-[#2563eb]" />
            <CardContent className="px-6 py-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                            <Briefcase size={20} className="text-[#2563eb]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-[#0f172a]">{job.title}</h1>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                    <CalendarDays size={11} />
                                    Posted {new Date(job.created_at).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
                                </span>
                                {job.updated_at !== job.created_at && (
                                    <span className="text-xs text-slate-300">
                                        · Updated {new Date(job.updated_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <span className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${status?.className ?? "bg-slate-100 text-slate-500"}`}>
                        {status?.label ?? job.status}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full capitalize">
                        <Briefcase size={12} /> {job.employment_type}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                        <MapPin size={12} /> {job.is_remote ? "Remote" : job.location || "—"}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                        <Users size={12} /> {job.vacancies} {job.vacancies === 1 ? "vacancy" : "vacancies"}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                        <FileText size={12} /> {Number(job.application_count)} {Number(job.application_count) === 1 ? "application" : "applications"}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-[#2563eb] bg-blue-50 px-3 py-1.5 rounded-full">
                        <DollarSign size={12} /> RM {Number(job.salary_min).toLocaleString()} — RM {Number(job.salary_max).toLocaleString()}
                    </span>
                    {job.is_remote && (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full">
                            <Globe size={12} /> Remote
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
