import Image from "next/image"
import { ProjectApplicant } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"

export function ApplicantsTab({ applicants }: { applicants: ProjectApplicant[] }) {
    return (
        <Card className="rounded-xl border border-slate-200 shadow-sm">
            <CardContent className="px-5 py-4">
                {applicants.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                        <Users size={28} className="text-slate-200" />
                        <p className="text-sm font-medium text-slate-400">No applicants yet</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="pb-3 mb-1 border-b border-slate-100">
                            <span className="text-xs font-semibold text-slate-500">
                                {applicants.length} {applicants.length === 1 ? "applicant" : "applicants"}
                            </span>
                        </div>

                        {applicants.map((applicant, i) => (
                            <div key={applicant.clerk_id ?? i} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 hover:border-slate-300 transition-colors">
                                <span className="text-xs font-bold text-slate-300 w-5 text-center shrink-0">{i + 1}</span>

                                {applicant.profile_image ? (
                                    <Image
                                        src={applicant.profile_image}
                                        alt={`${applicant.first_name} ${applicant.last_name}`}
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-500 shrink-0">
                                        {applicant.first_name?.[0]}{applicant.last_name?.[0]}
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#0f172a]">{applicant.first_name} {applicant.last_name}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{applicant.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
