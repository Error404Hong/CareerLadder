import { Job } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle2, Code2, DollarSign } from "lucide-react"

const statusConfig = {
    open:   { label: "Open",   className: "bg-green-100 text-green-700 border border-green-200" },
    closed: { label: "Closed", className: "bg-red-100 text-red-600 border border-red-200" },
}

function InfoRow({ label, value, index = 0 }: { label: string; value: React.ReactNode; index?: number }) {
    return (
        <div className={`flex items-center justify-between px-2 py-2.5 rounded-lg ${index % 2 === 0 ? "bg-slate-50/70" : ""}`}>
            <span className="text-xs font-medium text-slate-500">{label}</span>
            <span className="text-sm font-semibold text-[#0f172a]">{value}</span>
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
                        <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-4">
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
                        <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-4">
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

                <Card className="rounded-xl border border-slate-200 shadow-sm border-t-2 border-t-[#2563eb]">
                    <CardHeader className="px-5 pt-4 pb-0">
                        <CardTitle className="text-sm font-semibold text-[#0f172a]">Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 py-2">
                        <InfoRow index={0} label="Status" value={
                            <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${status?.className ?? "bg-slate-100 text-slate-500"}`}>
                                {status?.label ?? job.status}
                            </span>
                        } />
                        <InfoRow index={1} label="Type"         value={<span className="capitalize">{job.employment_type}</span>} />
                        <InfoRow index={2} label="Location"     value={job.is_remote ? "Remote" : (job.location || "—")} />
                        <InfoRow index={3} label="Remote"       value={job.is_remote ? "Yes" : "No"} />
                        <InfoRow index={4} label="Vacancies"    value={job.vacancies} />
                        <InfoRow index={5} label="Applications" value={Number(job.application_count)} />
                        <InfoRow index={6} label="Posted"       value={new Date(job.created_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })} />
                    </CardContent>
                </Card>

                <Card className="rounded-xl border border-blue-100 shadow-sm bg-blue-50/40">
                    <CardHeader className="px-5 pt-4 pb-0">
                        <CardTitle className="text-sm font-semibold text-[#0f172a] flex items-center gap-2">
                            <DollarSign size={14} className="text-[#2563eb]" /> Salary Range
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 py-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Min</p>
                                <p className="text-xl font-bold text-[#2563eb]">RM {Number(job.salary_min).toLocaleString()}</p>
                            </div>
                            <div className="text-slate-300 text-sm">—</div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Max</p>
                                <p className="text-xl font-bold text-[#0f172a]">RM {Number(job.salary_max).toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
