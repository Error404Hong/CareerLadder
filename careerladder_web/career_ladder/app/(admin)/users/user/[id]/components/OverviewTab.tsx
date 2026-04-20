import { Student } from "@/types/student"
import { Mail, MapPin, GraduationCap, Briefcase, Globe, Linkedin, ExternalLink } from "lucide-react"

export function OverviewTab({ profile }: { profile: Student }) {
    const infoItems = [
        { icon: <Mail size={14} />,         label: "Email",          value: profile.email },
        { icon: <MapPin size={14} />,        label: "Location",       value: profile.location || "—" },
        { icon: <GraduationCap size={14} />, label: "Major",          value: profile.major || "—" },
        { icon: <Briefcase size={14} />,     label: "Job Preference", value: profile.job_preference || "—" },
    ]

    return (
        <div className="flex flex-col gap-6">
            {/* About */}
            {profile.profile_summary && (
                <div className="rounded-xl bg-slate-50 border border-slate-100 px-5 py-4 border-l-4 border-l-[#2563eb]">
                    <p className="text-xs font-semibold text-[#2563eb] uppercase tracking-wider mb-2">About</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{profile.profile_summary}</p>
                </div>
            )}

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {infoItems.map(({ icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5">
                        <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                            {icon}
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-400">{label}</p>
                            <p className="text-sm font-medium text-[#0f172a] mt-0.5 truncate">{value}</p>
                        </div>
                    </div>
                ))}

                {/* Work status */}
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <Globe size={14} />
                    </span>
                    <div>
                        <p className="text-xs text-slate-400">Work Status</p>
                        <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${profile.work_status ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                            {profile.work_status ? "Open to Work" : "Not Looking"}
                        </span>
                    </div>
                </div>

                {/* LinkedIn */}
                {profile.linkedin_url && (
                    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5">
                        <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            <Linkedin size={14} />
                        </span>
                        <div>
                            <p className="text-xs text-slate-400">LinkedIn</p>
                            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm font-medium text-[#2563eb] hover:underline mt-0.5">
                                View Profile <ExternalLink size={11} />
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
