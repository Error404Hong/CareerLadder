import Image from "next/image"
import { TrainingRegistration } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"

const registrationStatusConfig: Record<string, { label: string; className: string }> = {
    pending:  { label: "Pending",  className: "bg-amber-100 text-amber-700 border border-amber-200" },
    approved: { label: "Approved", className: "bg-green-100 text-green-700 border border-green-200" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-600 border border-red-200" },
    attended: { label: "Attended", className: "bg-blue-100 text-blue-700 border border-blue-200" },
}

export function RegistrantsTab({ registrants }: { registrants: TrainingRegistration[] }) {
    return (
        <Card className="rounded-xl border border-slate-200 shadow-sm">
            <CardContent className="px-5 py-4">
                {registrants.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                        <Users size={28} className="text-slate-200" />
                        <p className="text-sm font-medium text-slate-400">No registrants yet</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {registrants.map((registrant, i) => {
                            const statusCfg = registrationStatusConfig[registrant.status] ?? { label: registrant.status, className: "bg-slate-100 text-slate-500 border border-slate-200" }
                            return (
                                <div key={registrant.clerk_id ?? i} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 hover:border-slate-300 transition-colors">
                                    {registrant.profileImage ? (
                                        <Image
                                            src={registrant.profileImage}
                                            alt={`${registrant.firstName} ${registrant.lastName}`}
                                            width={40}
                                            height={40}
                                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-500 shrink-0">
                                            {registrant.firstName?.[0]}{registrant.lastName?.[0]}
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#0f172a]">{registrant.firstName} {registrant.lastName}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{registrant.email}</p>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-xs text-slate-400">
                                            {new Date(registrant.registered_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                                        </span>
                                        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${statusCfg.className}`}>
                                            {statusCfg.label}
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
