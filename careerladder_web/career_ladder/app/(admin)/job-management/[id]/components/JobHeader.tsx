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
            {/* Hero — icon + title live inside the dark band */}
            <div className="bg-[#0f172a] relative overflow-hidden px-6 py-5">
                <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-[#2563eb]/15" />
                <div className="absolute top-0 right-24 w-32 h-32 rounded-full bg-[#2563eb]/8" />

                <div className="absolute top-4 right-5">
                    <span className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${status?.className ?? "bg-slate-100 text-slate-500"}`}>
                        {status?.label ?? job.status}
                    </span>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/20 flex items-center justify-center shrink-0">
                        <Briefcase size={18} className="text-blue-300" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">{job.title}</h1>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                <CalendarDays size={11} />
                                Posted {new Date(job.created_at).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
                            </span>
                            {job.updated_at !== job.created_at && (
                                <span className="text-xs text-slate-500">
                                    · Updated {new Date(job.updated_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <CardContent className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
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
