interface EmptyStateProps {
    icon: React.ElementType
    label: string
}

export function EmptyState({ icon: Icon, label }: EmptyStateProps) {
    return (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 py-14">
            <Icon size={28} className="text-slate-200" />
            <p className="text-sm text-slate-400">{label}</p>
        </div>
    )
}
