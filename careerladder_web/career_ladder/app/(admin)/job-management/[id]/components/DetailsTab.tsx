import { Job } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle2, Code2 } from "lucide-react"

const statusConfig = {
    open:   { label: "Open",   className: "bg-green-100 text-green-700 border border-green-200" },
    closed: { label: "Closed", className: "bg-red-100 text-red-600 border border-red-200" },
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
            <span className="text-xs text-slate-400">{label}</span>
            <span className="text-sm font-medium text-[#0f172a]">{value}</span>
        </div>
    )
}

export function DetailsTab({ job }: { job: Job }) {
    const status = statusConfig[job.status as keyof typeof statusConfig]

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Left column */}
            <div className="lg:col-span-2 flex flex-col gap-5">

                {/* Description */}
                <Card className="rounded-xl border border-slate-200 shadow-sm">
                    <CardHeader className="px-5 pt-4 pb-0">
                        <CardTitle className="text-sm font-semibold text-[#0f172a] flex items-center gap-2">
                            <FileText size={15} className="text-[#2563eb]" /> Job Description
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 py-3">
                        <div className="rounded-lg border-l-4 border-l-[#2563eb] bg-slate-50 border border-slate-100 px-4 py-3">
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Requirements + Skills */}
                <Card className="rounded-xl border border-slate-200 shadow-sm">
                    <CardHeader className="px-5 pt-4 pb-0">
                        <CardTitle className="text-sm font-semibold text-[#0f172a] flex items-center gap-2">
                            <CheckCircle2 size={15} className="text-[#2563eb]" /> Requirements
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 py-3">
                        <div className="rounded-lg border-l-4 border-l-violet-400 bg-slate-50 border border-slate-100 px-4 py-3">
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.requirements}</p>
                        </div>
                    </CardContent>

                    {job.skills_required?.length > 0 && (
                        <>
                            <div className="border-t border-slate-100 mx-5" />
                            <CardHeader className="px-5 pt-4 pb-0">
                                <CardTitle className="text-sm font-semibold text-[#0f172a] flex items-center gap-2">
                                    <Code2 size={15} className="text-[#2563eb]" /> Skills Required
                                    <span className="text-xs text-slate-400 font-normal">({job.skills_required.length})</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-5 py-3">
                                <div className="flex flex-wrap gap-2">
                                    {job.skills_required.map((skill) => (
                                        <span key={skill} className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </>
                    )}
                </Card>
            </div>

            {/* Right sidebar */}
            <div className="flex flex-col gap-5">

                <Card className="rounded-xl border border-slate-200 shadow-sm">
                    <CardHeader className="px-5 pt-4 pb-0">
                        <CardTitle className="text-sm font-semibold text-[#0f172a]">Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 py-2">
                        <InfoRow label="Status" value={
                            <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${status?.className ?? "bg-slate-100 text-slate-500"}`}>
                                {status?.label ?? job.status}
                            </span>
                        } />
                        <InfoRow label="Type"         value={<span className="capitalize">{job.employment_type}</span>} />
                        <InfoRow label="Location"     value={job.is_remote ? "Remote" : (job.location || "—")} />
                        <InfoRow label="Remote"       value={job.is_remote ? "Yes" : "No"} />
                        <InfoRow label="Vacancies"    value={job.vacancies} />
                        <InfoRow label="Applications" value={Number(job.application_count)} />
                        <InfoRow label="Posted"       value={new Date(job.created_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })} />
                    </CardContent>
                </Card>

                <Card className="rounded-xl border border-slate-200 shadow-sm">
                    <CardHeader className="px-5 pt-4 pb-0">
                        <CardTitle className="text-sm font-semibold text-[#0f172a]">Salary Range</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 py-3">
                        <div className="flex items-center justify-between">
                            <div className="text-center">
                                <p className="text-xs text-slate-400 mb-1">Min</p>
                                <p className="text-lg font-bold text-[#0f172a]">RM {Number(job.salary_min).toLocaleString()}</p>
                            </div>
                            <div className="flex-1 mx-3 h-px bg-slate-200 relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs text-slate-300 bg-white px-1">to</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-slate-400 mb-1">Max</p>
                                <p className="text-lg font-bold text-[#0f172a]">RM {Number(job.salary_max).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-linear-to-r from-[#2563eb] to-violet-500 rounded-full w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
