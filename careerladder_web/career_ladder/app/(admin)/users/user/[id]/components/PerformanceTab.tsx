import { Star, TrendingUp } from "lucide-react"
import { Performance } from "@/types/performance"
import Image from "next/image"

export function PerformanceTab({ performances }: { performances: Performance[] }) {
    if (performances.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
                <TrendingUp size={32} className="text-slate-200" />
                <p className="text-sm font-medium text-slate-400">No performance reviews yet</p>
                <p className="text-xs text-slate-300">Reviews appear after completing a project with a company</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {performances.map((perf, i) => {
                const metrics = [
                    { label: "Communication",    value: perf.communication },
                    { label: "Problem Solving",  value: perf.problem_solving },
                    { label: "Professionalism",  value: perf.professionalism },
                    { label: "Teamwork",         value: perf.teamwork },
                    { label: "Technical Skills", value: perf.technical_skills },
                ]

                return (
                    <div key={i} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                        {/* Company header */}
                        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-100 bg-slate-50">
                            <div className="flex items-center gap-3">
                                {perf.companyLogo ? (
                                    <Image
                                        src={perf.companyLogo}
                                        alt={perf.company_name}
                                        width={36}
                                        height={36}
                                        className="w-9 h-9 rounded-lg object-cover border border-slate-200"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-500">
                                        {perf.company_name?.[0]}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-semibold text-[#0f172a]">{perf.company_name}</p>
                                    <p className="text-xs text-slate-400">{perf.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Star size={14} className="text-amber-400 fill-amber-400" />
                                <span className="text-sm font-bold text-[#0f172a]">{Number(perf.overall_rating).toFixed(1)}</span>
                                <span className="text-xs text-slate-400">/ 5</span>
                            </div>
                        </div>

                        {/* Metrics */}
                        <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                            {metrics.map(({ label, value }) => (
                                <div key={label}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs text-slate-500">{label}</span>
                                        <span className="text-xs font-semibold text-[#0f172a]">{value}<span className="text-slate-300 font-normal">/5</span></span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full bg-[#2563eb]" style={{ width: `${(value / 5) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Comments */}
                        {perf.comments && (
                            <div className="px-5 pb-4">
                                <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3 border-l-4 border-l-slate-300">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Comments</p>
                                    <p className="text-sm text-slate-600 leading-relaxed">{perf.comments}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
