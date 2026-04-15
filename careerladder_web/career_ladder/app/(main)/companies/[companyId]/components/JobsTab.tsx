"use client"

import { useRouter } from "next/navigation"
import { Job } from "@/types"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, DollarSign, Wifi, ChevronRight, Briefcase } from "lucide-react"

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

function JobCard({ job }: { job: Job }) {
    const router = useRouter()
    const salaryMin = parseInt(job.salary_min)
    const salaryMax = parseInt(job.salary_max)
    const hasSalary = !isNaN(salaryMin) && !isNaN(salaryMax)

    return (
        <div
            onClick={() => router.push(`/jobs?search=${encodeURIComponent(job.title)}`)}
            className="cursor-pointer bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200 p-5 flex flex-col gap-4"
        >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-800 leading-snug">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border-0 font-medium uppercase tracking-wide">
                                {job.employment_type}
                            </Badge>
                            {job.is_remote && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                                    <Wifi size={10} /> Remote
                                </span>
                            )}
                            <StatusBadge status={job.status} />
                        </div>
                    </div>
                    <ChevronRight size={15} className="text-slate-300 shrink-0 mt-1" />
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{job.description}</p>

                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {job.location && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin size={11} className="text-slate-400" /> {job.location}
                        </span>
                    )}
                    {hasSalary && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <DollarSign size={11} className="text-slate-400" />
                            RM {salaryMin.toLocaleString()} – {salaryMax.toLocaleString()}
                        </span>
                    )}
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Users size={11} className="text-slate-400" /> {job.vacancies} {job.vacancies === 1 ? "vacancy" : "vacancies"}
                    </span>
                </div>
            </div>
    )
}

interface JobsTabProps {
    jobs: Job[]
}

export function JobsTab({ jobs }: JobsTabProps) {
    const openJobs = jobs.filter((j) => j.status?.toLowerCase() === "open")

    if (openJobs.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3 py-20">
                <Briefcase size={28} className="text-slate-200" />
                <p className="text-sm text-slate-400">No job opportunities available right now.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {openJobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
    )
}
