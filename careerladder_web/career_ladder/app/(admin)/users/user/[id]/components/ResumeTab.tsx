import { FileText, ExternalLink } from "lucide-react"

export function ResumeTab({ resumeUrl }: { resumeUrl: string }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <FileText size={16} className="text-[#2563eb]" />
                <h3 className="text-sm font-semibold text-[#0f172a]">Resume</h3>
            </div>
            <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 hover:border-[#2563eb] hover:shadow-sm transition-all group max-w-sm w-full"
            >
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0f172a]">Resume.pdf</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click to view</p>
                </div>
                <ExternalLink size={14} className="text-slate-300 group-hover:text-[#2563eb] transition-colors shrink-0" />
            </a>
        </div>
    )
}
