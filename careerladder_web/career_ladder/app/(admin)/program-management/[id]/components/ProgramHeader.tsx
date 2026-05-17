import { Training } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, CalendarDays, Users, Clock, Globe, MapPin } from "lucide-react"

const statusConfig: Record<string, { label: string; className: string }> = {
    open:      { label: "Open",      className: "bg-green-100 text-green-700 border border-green-200" },
    closed:    { label: "Closed",    className: "bg-red-100 text-red-600 border border-red-200" },
    completed: { label: "Completed", className: "bg-slate-100 text-slate-600 border border-slate-200" },
    cancelled: { label: "Cancelled", className: "bg-orange-100 text-orange-600 border border-orange-200" },
}

export function ProgramHeader({ program }: { program: Training }) {
    const status = statusConfig[program.status] ?? { label: program.status, className: "bg-slate-100 text-slate-500 border border-slate-200" }

    return (
        <Card className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Hero — icon + title live inside the dark band */}
            <div className="bg-[#0f172a] relative overflow-hidden px-6 py-5">
                <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-emerald-500/15" />
                <div className="absolute top-0 right-24 w-32 h-32 rounded-full bg-emerald-500/8" />

                <div className="absolute top-4 right-5">
                    <span className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${status.className}`}>
                        {status.label}
                    </span>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/20 flex items-center justify-center shrink-0">
                        <BookOpen size={18} className="text-emerald-300" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">{program.title}</h1>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                <CalendarDays size={11} />
                                Created {new Date(program.created_at).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
                            </span>
                            {program.updated_at && program.updated_at !== program.created_at && (
                                <span className="text-xs text-slate-500">
                                    · Updated {new Date(program.updated_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <CardContent className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                        <CalendarDays size={12} />
                        {new Date(program.date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                        {program.time && ` · ${program.time}`}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                        <Clock size={12} /> {program.duration}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                        <Users size={12} /> {program.vacancies} {program.vacancies === 1 ? "vacancy" : "vacancies"}
                    </span>
                    {program.meeting_url && !program.location ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                            <Globe size={12} /> Online
                        </span>
                    ) : program.location ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                            <MapPin size={12} /> {program.location}
                        </span>
                    ) : null}
                    {!program.is_public && (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                            Private
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
