import Image from "next/image"
import { Building2, MapPin, Globe } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { CompanyProfile } from "@/types/companyProfile"

const accountStatusConfig: Record<number, { label: string; className: string }> = {
    1: { label: "Active", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    2: { label: "Disabled", className: "bg-red-50 text-red-600 border border-red-200" },
    3: { label: "Frozen", className: "bg-blue-50 text-blue-600 border border-blue-200" },
}

export function CompanyHeader({ profile }: { profile: CompanyProfile }) {
    const status = accountStatusConfig[Number(profile.status)] ?? { label: "Unknown", className: "bg-slate-100 text-slate-500" }

    return (
        <Card className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-2 w-full bg-linear-to-r from-[#2563eb] via-violet-500 to-[#2563eb]" />
            <CardContent className="px-6 py-6">
                <div className="flex items-start gap-5">
                    {profile.image_url ? (
                        <Image
                            src={profile.image_url}
                            alt={profile.company_name}
                            width={72}
                            height={72}
                            className="w-18 h-18 rounded-xl object-cover border-2 border-slate-200 shrink-0"
                        />
                    ) : (
                        <div className="w-18 h-18 rounded-xl bg-linear-to-br from-[#2563eb] to-violet-500 flex items-center justify-center text-white text-2xl font-bold shrink-0" style={{ width: 72, height: 72 }}>
                            {profile.company_name?.[0]?.toUpperCase()}
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                                <h1 className="text-xl font-bold text-[#0f172a]">{profile.company_name}</h1>
                                <p className="text-sm text-slate-500 mt-0.5">{profile.industry}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${status.className}`}>
                                    {status.label}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5">
                            {profile.location && (
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                    <MapPin size={12} /> {profile.location}
                                </span>
                            )}
                            {profile.website && (
                                <a
                                    href={profile.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-[#2563eb] hover:underline"
                                >
                                    <Globe size={12} /> {profile.website}
                                </a>
                            )}
                            {profile.company_size && (
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                    <Building2 size={12} /> {profile.company_size} employees
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
