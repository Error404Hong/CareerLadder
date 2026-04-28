export function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200">
                {icon}
            </div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-xs text-slate-300">{subtitle}</p>
        </div>
    )
}
