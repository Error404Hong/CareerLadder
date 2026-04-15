import { CompanyProfile } from "@/types"
import { Building2, Users, CalendarDays, MapPin, Mail, Globe } from "lucide-react"

interface AboutTabProps {
    profile: CompanyProfile
}

export function AboutTab({ profile }: AboutTabProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Description */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">About {profile.company_name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                    {profile.description || "No description provided."}
                </p>
            </div>

            {/* Details card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-slate-700">Company Details</h3>
                <div className="flex flex-col gap-3">
                    {profile.industry && (
                        <div className="flex items-start gap-3">
                            <Building2 size={14} className="text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-400">Industry</p>
                                <p className="text-sm text-slate-700 font-medium">{profile.industry}</p>
                            </div>
                        </div>
                    )}
                    {profile.company_size && (
                        <div className="flex items-start gap-3">
                            <Users size={14} className="text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-400">Company Size</p>
                                <p className="text-sm text-slate-700 font-medium">{profile.company_size} employees</p>
                            </div>
                        </div>
                    )}
                    {profile.founded_year && (
                        <div className="flex items-start gap-3">
                            <CalendarDays size={14} className="text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-400">Founded</p>
                                <p className="text-sm text-slate-700 font-medium">{profile.founded_year}</p>
                            </div>
                        </div>
                    )}
                    {profile.location && (
                        <div className="flex items-start gap-3">
                            <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-400">Location</p>
                                <p className="text-sm text-slate-700 font-medium">{profile.location}</p>
                            </div>
                        </div>
                    )}
                    {profile.email && (
                        <div className="flex items-start gap-3">
                            <Mail size={14} className="text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-400">Email</p>
                                <p className="text-sm text-slate-700 font-medium">{profile.email}</p>
                            </div>
                        </div>
                    )}
                    {profile.website && (
                        <div className="flex items-start gap-3">
                            <Globe size={14} className="text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-slate-400">Website</p>
                                <a
                                    href={profile.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
                                >
                                    {profile.website}
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
