import { Mail, MapPin, Globe, Building2, Calendar, Users } from "lucide-react"
import { CompanyProfile } from "@/types/companyProfile"

export function OverviewTab({ profile }: { profile: CompanyProfile }) {
    const infoItems = [
        { icon: Mail,      label: "Email",        value: profile.email },
        { icon: MapPin,    label: "Location",     value: profile.location },
        { icon: Globe,     label: "Website",      value: profile.website,       href: profile.website },
        { icon: Building2, label: "Industry",     value: profile.industry },
        { icon: Users,     label: "Company Size", value: profile.company_size ? `${profile.company_size} employees` : null },
        { icon: Calendar,  label: "Founded",      value: profile.founded_year ? String(profile.founded_year) : null },
    ].filter((item) => item.value)

    return (
        <div className="flex flex-col gap-6">
            {profile.description && (
                <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 border-l-4 border-l-[#2563eb]">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">About</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{profile.description}</p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {infoItems.map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <Icon size={15} className="text-[#2563eb]" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-400">{label}</p>
                            {href ? (
                                <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#2563eb] hover:underline truncate block">
                                    {value}
                                </a>
                            ) : (
                                <p className="text-sm font-medium text-[#0f172a] truncate">{value}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
