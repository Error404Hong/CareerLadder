import { Job } from "@/types"
import { Building2, MapPin, DollarSign, Users, Briefcase } from "lucide-react"

interface JobCardProps {
    job: Job & { company_name?: string }
    onClick: () => void
}

export function JobCard({ job, onClick }: JobCardProps) {
    const salaryMin = parseInt(job.salary_min)
    const salaryMax = parseInt(job.salary_max)
    const hasSalary = !isNaN(salaryMin) && !isNaN(salaryMax) && salaryMin > 0

    return (
        <div
            onClick={onClick}
            className="group relative bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
        >
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

            <div className="p-5 flex flex-col gap-3.5">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
                            {job.title}
                        </h3>
                        {job.company_name && (
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                <Building2 size={10} /> {job.company_name}
                            </p>
                        )}
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                        <Briefcase size={13} className="text-indigo-500" />
                    </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{job.description}</p>

                {/* Footer meta */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2 border-t border-slate-100">
                    {job.location && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                            <MapPin size={10} className="text-slate-300" /> {job.location}
                        </span>
                    )}
                    {hasSalary && (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <DollarSign size={10} /> RM {salaryMin.toLocaleString()} – {salaryMax.toLocaleString()}
                        </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
                        <Users size={10} /> {job.vacancies} {job.vacancies === 1 ? "spot" : "spots"}
                    </span>
                </div>
            </div>
        </div>
    )
}
