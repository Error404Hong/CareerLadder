import { File, ExternalLink, Building2, CalendarDays } from "lucide-react"
import { Certification } from "@/types"

export function CertificationCard({ cert }: { cert: Certification }) {
    const issuedDate = new Date(cert.issued_at).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
    })

    return (
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden hover:border-[#2563eb]/30 hover:shadow-md transition-all duration-200">
            <div className="h-1 w-full bg-linear-to-r from-[#0f172a] to-[#2563eb]" />

            <div className="p-5">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <File size={20} className="text-[#2563eb]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#0f172a] text-sm leading-tight">{cert.title}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <Building2 size={11} className="text-slate-400 shrink-0" />
                            <span className="text-[11px] text-[#2563eb]">{cert.company_name}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <CalendarDays size={11} />
                        <span>Issued {issuedDate}</span>
                    </div>

                    {cert.certification_url ? (
                        <a
                            href={cert.certification_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[11px] font-medium text-[#2563eb] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <ExternalLink size={11} />
                            View Certificate
                        </a>
                    ) : (
                        <span className="text-[11px] text-slate-300 italic">No link available</span>
                    )}
                </div>
            </div>
        </div>
    )
}
