import { Trophy, Zap, Star, Shield, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const XP_TIERS = [
    { label: "Novice", min: 0, max: 999, color: "#94a3b8", bg: "from-slate-400 to-slate-500", icon: Star },
    { label: "Apprentice", min: 1000, max: 2999, color: "#22c55e", bg: "from-green-400 to-emerald-500", icon: Zap },
    { label: "Junior", min: 3000, max: 4999, color: "#3b82f6", bg: "from-blue-400 to-blue-600", icon: Shield },
    { label: "Expert", min: 5000, max: 7999, color: "#a855f7", bg: "from-purple-400 to-purple-600", icon: Award },
    { label: "Professional", min: 8000, max: 11999, color: "#f59e0b", bg: "from-amber-400 to-orange-500", icon: Trophy },
    { label: "Master", min: 12000, max: Infinity, color: "#ef4444", bg: "from-rose-400 to-red-600", icon: Trophy },
]

function getTier(exp: number) {
    return XP_TIERS.find(t => exp >= t.min && exp <= t.max) ?? XP_TIERS[0]
}

function getProgress(exp: number) {
    const tier = getTier(exp)
    if (tier.max === Infinity) return 100
    const range = tier.max - tier.min + 1
    return Math.min(Math.round(((exp - tier.min) / range) * 100), 100)
}

function getNextTier(exp: number) {
    const idx = XP_TIERS.findIndex(t => exp >= t.min && exp <= t.max)
    return idx < XP_TIERS.length - 1 ? XP_TIERS[idx + 1] : null
}

export function ExpBanner({ exp, isLoading }: { exp: number; isLoading: boolean }) {
    const tier = getTier(exp)
    const next = getNextTier(exp)
    const progress = getProgress(exp)
    const TierIcon = tier.icon

    return (
        <Card className="rounded-xl border border-slate-100 shadow-sm overflow-hidden mb-6">
            <div className={`h-1.5 w-full bg-linear-to-r ${tier.bg}`} />
            <CardContent className="px-6 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-linear-to-br ${tier.bg} shadow-md shrink-0`}>
                            <TierIcon size={24} className="text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-[#0f172a]">
                                    {isLoading ? "—" : tier.label}
                                </span>
                                <Badge
                                    variant="outline"
                                    className="text-[10px] px-2 py-0 border-current"
                                    style={{ color: tier.color, borderColor: tier.color + "40", background: tier.color + "10" }}
                                >
                                    {tier.label}
                                </Badge>
                            </div>
                            <p className="text-sm text-slate-400 mt-0.5">
                                {isLoading ? "Loading…" : (
                                    next
                                        ? <><span className="font-semibold text-[#0f172a]">{exp.toLocaleString()}</span> / {next.min.toLocaleString()} XP to {next.label}</>
                                        : <><span className="font-semibold text-[#0f172a]">{exp.toLocaleString()}</span> XP — Max Rank Reached</>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="text-right hidden sm:block">
                        <p className="text-3xl font-bold text-[#0f172a]">{isLoading ? "—" : exp.toLocaleString()}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Experience Points</p>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                        <span>{tier.label} ({tier.min.toLocaleString()} XP)</span>
                        {next ? <span>{next.label} ({next.min.toLocaleString()} XP)</span> : <span>Max Rank</span>}
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full bg-linear-to-r ${tier.bg} transition-all duration-700`}
                            style={{ width: `${isLoading ? 0 : progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[11px] mt-1.5">
                        <span>
                            {XP_TIERS.map((t, i) => (
                                <span key={t.label} className={`mr-3 ${exp >= t.min ? "text-slate-500 font-medium" : "text-slate-300"}`}>
                                    {i + 1}. {t.label}
                                </span>
                            ))}
                        </span>
                        <span className="text-slate-400 font-medium shrink-0">{isLoading ? "—" : progress}%</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
