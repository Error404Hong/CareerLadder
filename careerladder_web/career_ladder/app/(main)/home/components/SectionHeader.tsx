import { ArrowRight } from "lucide-react"

interface SectionHeaderProps {
    title: string
    count: number
    onViewAll: () => void
}

export function SectionHeader({ title, count, onViewAll }: SectionHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-800">{title}</h2>
                {count > 0 && (
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full tabular-nums">
                        {count}
                    </span>
                )}
            </div>
            {count > 0 && (
                <button
                    onClick={onViewAll}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                    View all <ArrowRight size={12} />
                </button>
            )}
        </div>
    )
}
