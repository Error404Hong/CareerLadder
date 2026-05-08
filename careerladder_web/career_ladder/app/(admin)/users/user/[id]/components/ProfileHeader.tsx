"use client"

import { Student } from "@/types/student"
import { Mail, MapPin, CalendarDays, Snowflake, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XP_TIERS } from "@/app/(main)/achivements/components/ExpBanner"
import Image from "next/image"

const accountStatusConfig: Record<number, { label: string; className: string }> = {
    1: { label: "Active",  className: "bg-green-100 text-green-700 border border-green-200" },
    3: { label: "Frozen",  className: "bg-blue-100 text-blue-600 border border-blue-200" },
}

export function ProfileHeader({ profile, studentExp, onFreeze, onUnfreeze }: { profile: Student; studentExp: number; onFreeze: () => void; onUnfreeze: () => void }) {
    const statusConfig = accountStatusConfig[Number(profile.status)]
        ?? { label: "Unknown", className: "bg-slate-100 text-slate-500 border border-slate-200" }

    const tier = XP_TIERS.find(t => studentExp >= t.min && studentExp <= t.max) ?? XP_TIERS[0]
    const TierIcon = tier.icon

    return (
        <Card className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-linear-to-r from-[#2563eb] to-violet-500" />
            <CardContent className="px-6 py-6">
                <div className="flex items-start gap-6 flex-wrap">
                    {/* Avatar */}
                    {profile.profileImage ? (
                        <Image
                            src={profile.profileImage}
                            alt={`${profile.firstName} ${profile.lastName}`}
                            width={80}
                            height={80}
                            className="w-20 h-20 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-linear-to-br from-[#2563eb] to-violet-500 flex items-center justify-center text-xl font-bold text-white shrink-0">
                            {profile.firstName?.[0]}{profile.lastName?.[0]}
                        </div>
                    )}

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-xl font-bold text-[#0f172a]">
                                {profile.firstName} {profile.lastName}
                            </h1>
                            <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${statusConfig.className}`}>
                                {statusConfig.label}
                            </span>
                            {Number(profile.status) === 1 && (
                                <Button size="sm" variant="outline" onClick={onFreeze} className="h-7 px-2.5 gap-1 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer">
                                    <Snowflake size={11} />
                                    Freeze
                                </Button>
                            )}
                            {Number(profile.status) === 3 && (
                                <Button size="sm" variant="outline" onClick={onUnfreeze} className="h-7 px-2.5 gap-1 text-xs text-green-600 border-green-200 hover:bg-green-50 cursor-pointer">
                                    <ShieldCheck size={11} />
                                    Unfreeze
                                </Button>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">{profile.major || "No major specified"}</p>
                        <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                            <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Mail size={12} /> {profile.email}
                            </span>
                            {profile.location && (
                                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                    <MapPin size={12} /> {profile.location}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                <CalendarDays size={12} /> Joined {new Date(profile.created_at).toLocaleDateString("en-MY", { year: "numeric", month: "short", day: "numeric" })}
                            </span>
                            {/* XP + Tier pill */}
                            <span
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border"
                                style={{ color: tier.color, borderColor: tier.color + "35", background: tier.color + "12" }}
                            >
                                <TierIcon size={11} />
                                {tier.label} · {studentExp.toLocaleString()} XP
                            </span>
                        </div>
                    </div>

                    {/* Profile completion */}
                    <div className="shrink-0 text-right">
                        <p className="text-xs text-slate-400 mb-1">Profile Completion</p>
                        <p className="text-2xl font-bold text-[#0f172a]">{profile.profile_completed === 1 ? 100 : 0}%</p>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5 ml-auto">
                            <div
                                className={`h-1.5 rounded-full transition-all ${profile.profile_completed === 1 ? "bg-[#2563eb]" : "bg-slate-200"}`}
                                style={{ width: profile.profile_completed === 1 ? "100%" : "0%" }}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
