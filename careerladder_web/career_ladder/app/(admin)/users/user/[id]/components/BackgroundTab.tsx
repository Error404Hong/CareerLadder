import { GraduationCap, Briefcase } from "lucide-react"
import { Education } from "@/types/education"
import { Experience } from "@/types/experience"

export function BackgroundTab({ educations, experiences }: { educations: Education[]; experiences: Experience[] }) {
    return (
        <div className="flex flex-col gap-8">

            {/* Education */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <GraduationCap size={16} className="text-[#2563eb]" />
                    <h3 className="text-sm font-semibold text-[#0f172a]">Education</h3>
                </div>
                {educations.length === 0 ? (
                    <p className="text-sm text-slate-400 pl-6">No education records</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {educations.map((edu) => (
                            <div key={edu.id} className="flex gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 hover:border-slate-300 transition-colors">
                                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                                    <GraduationCap size={16} className="text-[#2563eb]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 flex-wrap">
                                        <p className="text-sm font-semibold text-[#0f172a]">{edu.institution}</p>
                                        <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full shrink-0">
                                            {edu.start_year} — {edu.is_current ? "Present" : edu.end_year}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-0.5">{edu.field}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="border-t border-slate-100" />

            {/* Experience */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Briefcase size={16} className="text-[#2563eb]" />
                    <h3 className="text-sm font-semibold text-[#0f172a]">Work Experience</h3>
                </div>
                {experiences.length === 0 ? (
                    <p className="text-sm text-slate-400 pl-6">No work experience records</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {experiences.map((exp) => (
                            <div key={exp.id} className="flex gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 hover:border-slate-300 transition-colors">
                                <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
                                    <Briefcase size={16} className="text-violet-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 flex-wrap">
                                        <div>
                                            <p className="text-sm font-semibold text-[#0f172a]">{exp.jobtitle}</p>
                                            <p className="text-sm text-slate-500 mt-0.5">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full capitalize">
                                                {exp.employment_type}
                                            </span>
                                            <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full">
                                                {exp.start_year} — {exp.is_current ? "Present" : exp.end_year}
                                            </span>
                                        </div>
                                    </div>
                                    {exp.job_description && (
                                        <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">{exp.job_description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
