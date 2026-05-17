import { Training } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Target, ListChecks, Building2 } from "lucide-react"
import Image from "next/image"

const statusConfig: Record<string, { label: string; className: string }> = {
    open: { label: "Open", className: "bg-green-100 text-green-700 border border-green-200" },
    closed: { label: "Closed", className: "bg-red-100 text-red-600 border border-red-200" },
    completed: { label: "Completed", className: "bg-slate-100 text-slate-600 border border-slate-200" },
    cancelled: { label: "Cancelled", className: "bg-orange-100 text-orange-600 border border-orange-200" },
}

function InfoRow({ label, value, index = 0 }: { label: string; value: React.ReactNode; index?: number }) {
    return (
        <div className={`flex items-center justify-between px-2 py-2.5 rounded-lg ${index % 2 === 0 ? "bg-slate-50/70" : ""}`}>
            <span className="text-xs font-medium text-slate-500">{label}</span>
            <span className="text-sm font-semibold text-[#0f172a]">{value}</span>
        </div>
    )
}

export function DetailsTab({ program }: { program: Training }) {
    const status = statusConfig[program.status] ?? { label: program.status, className: "bg-slate-100 text-slate-500 border border-slate-200" }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Left column */}
            <div className="lg:col-span-2 flex flex-col gap-5">

                {/* Description */}
                <Card className="rounded-xl border border-slate-200 shadow-sm">
                    <CardHeader className="px-5 pt-4 pb-0">
                        <CardTitle className="text-sm font-semibold text-[#0f172a] flex items-center gap-2">
                            <FileText size={15} className="text-emerald-600" /> Description
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 py-3">
                        <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-4">
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{program.description}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Prerequisites */}
                {program.prerequisites && (
                    <Card className="rounded-xl border border-slate-200 shadow-sm">
                        <CardHeader className="px-5 pt-4 pb-0">
                            <CardTitle className="text-sm font-semibold text-[#0f172a] flex items-center gap-2">
                                <ListChecks size={15} className="text-emerald-600" /> Prerequisites
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 py-3">
                            <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-4">
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{program.prerequisites}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Expected Outcome */}
                {program.expected_outcome && (
                    <Card className="rounded-xl border border-slate-200 shadow-sm">
                        <CardHeader className="px-5 pt-4 pb-0">
                            <CardTitle className="text-sm font-semibold text-[#0f172a] flex items-center gap-2">
                                <Target size={15} className="text-emerald-600" /> Expected Outcome
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 py-3">
                            <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-4">
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{program.expected_outcome}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Right sidebar */}
            <div className="flex flex-col gap-5">

                {/* Company Info */}
                {program.company_name && (
                    <Card className="rounded-xl border border-slate-200 shadow-sm">
                        <CardHeader className="px-5 pt-4 pb-0">
                            <CardTitle className="text-sm font-semibold text-[#0f172a] flex items-center gap-2">
                                <Building2 size={14} className="text-slate-400" /> Company
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 py-3">
                            <div className="flex items-center gap-3">
                                {program.company_logo_url ? (
                                    <Image src={program.company_logo_url} alt={program.company_name} width={40} height={40} className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                                ) : (
                                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
                                        {program.company_name[0]}
                                    </div>
                                )}
                                <p className="text-sm font-semibold text-[#0f172a]">{program.company_name}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Overview */}
                <Card className="rounded-xl border border-slate-200 shadow-sm border-t-2 border-t-emerald-500">
                    <CardHeader className="px-5 pt-4 pb-0">
                        <CardTitle className="text-sm font-semibold text-[#0f172a]">Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 py-2">
                        <InfoRow index={0} label="Status" value={
                            <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${status.className}`}>
                                {status.label}
                            </span>
                        } />
                        <InfoRow index={1} label="Date"       value={new Date(program.date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })} />
                        <InfoRow index={2} label="Time"       value={program.time || "—"} />
                        <InfoRow index={3} label="Duration"   value={program.duration} />
                        <InfoRow index={4} label="Vacancies"  value={program.vacancies} />
                        <InfoRow index={5} label="Registered" value={Number(program.registration_count ?? 0)} />
                        <InfoRow index={6} label="Deadline"   value={new Date(program.application_deadline).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })} />
                        <InfoRow index={7} label="Visibility" value={program.is_public ? "Public" : "Private"} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
