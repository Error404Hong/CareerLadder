import Image from "next/image"
import { JobApplication } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Users, CheckCircle2, XCircle, Clock } from "lucide-react"

const applicationStatusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    pending:  { label: "Pending",  className: "bg-amber-50 text-amber-700 border border-amber-200",  icon: Clock },
    accepted: { label: "Accepted", className: "bg-green-50 text-green-700 border border-green-200",  icon: CheckCircle2 },
    rejected: { label: "Rejected", className: "bg-red-50 text-red-600 border border-red-200",        icon: XCircle },
}

export function ApplicantsTab({ applications }: { applications: JobApplication[] }) {
    return (
        <Card className="rounded-xl border border-slate-200 shadow-sm">
            <CardContent className="px-5 py-4">
                {applications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                        <Users size={28} className="text-slate-200" />
                        <p className="text-sm font-medium text-slate-400">No applications yet</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 flex-wrap pb-3 mb-1 border-b border-slate-100">
                            <span className="text-xs font-semibold text-slate-500">{applications.length} total</span>
                            {(["pending", "accepted", "rejected"] as const).map(s => {
                                const count = applications.filter(a => a.application_status === s).length
                                if (!count) return null
                                const cfg = applicationStatusConfig[s]
                                const StatusIcon = cfg.icon
                                return (
                                    <span key={s} className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${cfg.className}`}>
                                        <StatusIcon size={10} />
                                        {count} {cfg.label}
                                    </span>
                                )
                            })}
                        </div>

                        {applications.map((app, i) => {
                            const appStatus = applicationStatusConfig[app.application_status] ?? {
                                label: app.application_status,
                                className: "bg-slate-100 text-slate-500 border border-slate-200",
                                icon: Clock,
                            }
                            const StatusIcon = appStatus.icon
                            const fulfilledCount = app.skills_fulfilled?.length ?? 0
                            const requiredCount = app.skills_required?.length ?? 0

                            return (
                                <div key={app.application_id ?? i} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 hover:border-slate-300 transition-colors">
                                    {app.image_url ? (
                                        <Image
                                            src={app.image_url}
                                            alt={`${app.first_name} ${app.last_name}`}
                                            width={40}
                                            height={40}
                                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-500 shrink-0">
                                            {app.first_name?.[0]}{app.last_name?.[0]}
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#0f172a]">{app.first_name} {app.last_name}</p>
                                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                            <span className="text-xs text-slate-400">{app.email}</span>
                                            {app.major && <span className="text-xs text-slate-400">· {app.major}</span>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        {requiredCount > 0 && (
                                            <div className="text-center hidden sm:block">
                                                <p className="text-xs text-slate-400">Skills match</p>
                                                <p className="text-xs font-semibold text-[#0f172a]">{fulfilledCount}/{requiredCount}</p>
                                            </div>
                                        )}
                                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${appStatus.className}`}>
                                            <StatusIcon size={11} />
                                            {appStatus.label}
                                        </span>
                                        <span className="text-xs text-slate-300">
                                            {new Date(app.applied_at).toLocaleDateString("en-MY", { day: "numeric", month: "short" })}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
