import { Code2, Languages } from "lucide-react"
import { Skill } from "@/types/skill"
import { Language } from "@/types/language"

const proficiencyConfig: Record<string, { width: string }> = {
    Native:       { width: "w-full" },
    Fluent:       { width: "w-4/5" },
    Intermediate: { width: "w-3/5" },
    Basic:        { width: "w-2/5" },
}

export function SkillsTab({ skills, languages }: { skills: Skill[]; languages: Language[] }) {
    return (
        <div className="flex flex-col gap-8">

            {/* Skills */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Code2 size={16} className="text-[#2563eb]" />
                    <h3 className="text-sm font-semibold text-[#0f172a]">Skills</h3>
                    <span className="text-xs text-slate-400 ml-1">({skills.length})</span>
                </div>
                {skills.length === 0 ? (
                    <p className="text-sm text-slate-400">No skills listed</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                            <span key={skill.id} className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                {skill.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="border-t border-slate-100" />

            {/* Languages */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Languages size={16} className="text-[#2563eb]" />
                    <h3 className="text-sm font-semibold text-[#0f172a]">Languages</h3>
                </div>
                {languages.length === 0 ? (
                    <p className="text-sm text-slate-400">No languages listed</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {languages.map((lang) => {
                            const cfg = proficiencyConfig[lang.proficiency] ?? { width: "w-1/4" }
                            return (
                                <div key={lang.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3.5">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-[#0f172a]">{lang.language}</p>
                                        <span className="text-xs text-slate-500">{lang.proficiency}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full bg-[#2563eb] ${cfg.width}`} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
