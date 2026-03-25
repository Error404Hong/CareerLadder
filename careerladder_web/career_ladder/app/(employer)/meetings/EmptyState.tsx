"use client"

import { Video } from "lucide-react"

export function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Video size={36} className="text-slate-200" />
            <p className="text-sm font-medium text-slate-400">No {label} meetings</p>
            <p className="text-xs text-slate-300">Meetings will appear here once scheduled</p>
        </div>
    )
}