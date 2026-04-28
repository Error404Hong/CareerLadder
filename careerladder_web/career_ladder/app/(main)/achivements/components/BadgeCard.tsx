import { Award, Lightbulb, Zap, Users, Code2, MessageSquare, Building2, CalendarDays } from "lucide-react"
import { StudentBadge } from "@/types"

const BADGE_ICON_MAP: Record<string, React.ElementType> = {
    Lightbulb,
    Zap,
    Users,
    Code2,
    Award,
    MessageSquare,
}

export function BadgeCard({ badge }: { badge: StudentBadge }) {
    const Icon = BADGE_ICON_MAP[badge.icon] ?? Award
    const awardedDate = new Date(badge.awarded_at).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric"
    })

    return (
        <div className="bg-white border border-slate-100 rounded-xl p-5 flex flex-col gap-3 hover:border-[#2563eb]/30 hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#0f172a] to-[#2563eb] flex items-center justify-center shrink-0 shadow-sm">
                    <Icon className="text-white" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0f172a] text-sm leading-tight">{badge.name}</p>
                    <p className="text-[11px] text-[#2563eb] mt-0.5">{badge.title}</p>
                </div>
            </div>

            {badge.description && (
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{badge.description}</p>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Building2 size={11} />
                    <span className="truncate max-w-30">{badge.company_name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <CalendarDays size={11} />
                    <span>{awardedDate}</span>
                </div>
            </div>
        </div>
    )
}
