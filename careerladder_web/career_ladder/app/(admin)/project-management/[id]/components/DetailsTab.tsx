import { Project } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Code2, Building2, DollarSign } from "lucide-react"
import Image from "next/image"

const statusConfig: Record<string, { label: string; className: string }> = {
    open:        { label: "Open",        className: "bg-green-100 text-green-700 border border-green-200" },
    closed:      { label: "Closed",      className: "bg-red-100 text-red-600 border border-red-200" },
    in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-700 border border-blue-200" },
    completed:   { label: "Completed",   className: "bg-slate-100 text-slate-600 border border-slate-200" },
}

function InfoRow({ label, value, index = 0 }: { label: string; value: React.ReactNode; index?: number }) {
    return (
        <div className={`flex items-center justify-between px-2 py-2.5 rounded-lg ${index % 2 === 0 ? "bg-slate-50/70" : ""}`}>
            <span className="text-xs font-medium text-slate-500">{label}</span>
            <span className="text-sm font-semibold text-[#0f172a]">{value}</span>
        </div>
    )
}

export function DetailsTab({ project }: { project: Project }) {
    const status = statusConfig[project.status] ?? { label: project.status, className: "bg-slate-100 text-slate-500 border border-slate-200" }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Left column */}
            <div className="lg:col-span-2 flex flex-col gap-5">

                {/* Description */}
                <Card className="rounded-xl border border-slate-200 shadow-sm">
                    <CardHeader className="px-5 pt-4 pb-0">
                        <CardTitle className="text-sm font-semibold text-[#0f172a] flex items-center gap-2">
                            <FileText size={15} className="text-violet-600" /> Project Description
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 py-3">
                        <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-4">
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{project.description}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Skills Required */}
                {project.skills_required?.length > 0 && (
                    <Card className="rounded-xl border border-slate-200 shadow-sm">
                        <CardHeader className="px-5 pt-4 pb-0">
                            <CardTitle className="text-sm font-semibold text-[#0f172a] flex items-center gap-2">
                                <Code2 size={15} className="text-violet-600" /> Skills Required
                                <span className="text-xs text-slate-400 font-normal">({project.skills_required.length})</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 py-3">
                            <div className="flex flex-wrap gap-2">
                                {project.skills_required.map((skill) => (
                                    <span key={skill} className="text-xs font-medium px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Right sidebar */}
            <div className="flex flex-col gap-5">

                {/* Company Info */}
                {project.company_name && (
                    <Card className="rounded-xl border border-slate-200 shadow-sm">
                        <CardHeader className="px-5 pt-4 pb-0">
                            <CardTitle className="text-sm font-semibold text-[#0f172a] flex items-center gap-2">
                                <Building2 size={14} className="text-slate-400" /> Company
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 py-3">
                            <div className="flex items-center gap-3">
                                {project.company_logo_url ? (
                                    <Image src={project.company_logo_url} alt={project.company_name} width={40} height={40} className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                                ) : (
                                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
                                        {project.company_name[0]}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-semibold text-[#0f172a]">{project.company_name}</p>
                                    {project.company_email && <p className="text-xs text-slate-400">{project.company_email}</p>}
                                    {project.website && (
                                        <a href={project.website} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2563eb] hover:underline">
                                            {project.website}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Overview */}
                <Card className="rounded-xl border border-slate-200 shadow-sm border-t-2 border-t-violet-500">
                    <CardHeader className="px-5 pt-4 pb-0">
                        <CardTitle className="text-sm font-semibold text-[#0f172a]">Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 py-2">
                        <InfoRow index={0} label="Status" value={
                            <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${status.className}`}>
                                {status.label}
                            </span>
                        } />
                        <InfoRow index={1} label="Duration"     value={project.duration} />
                        <InfoRow index={2} label="Vacancies"    value={project.vacancies} />
                        <InfoRow index={3} label="Applications" value={Number(project.application_count)} />
                        <InfoRow index={4} label="Start Date"   value={new Date(project.start_date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })} />
                        <InfoRow index={5} label="End Date"     value={new Date(project.end_date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })} />
                        <InfoRow index={6} label="Posted"       value={new Date(project.created_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })} />
                    </CardContent>
                </Card>

                {/* Monthly Allowance */}
                <Card className="rounded-xl border border-violet-100 shadow-sm bg-violet-50/40">
                    <CardContent className="px-5 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                            <DollarSign size={18} className="text-violet-600" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Monthly Allowance</p>
                            <p className="text-2xl font-bold text-violet-600">RM {Number(project.allowance).toLocaleString()}</p>
                            <p className="text-xs text-slate-400">per month</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
