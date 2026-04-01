"use client"

import { Task, ProjectApplicant } from "@/types"
import { useDraggable } from "@dnd-kit/react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const priorityStyles: Record<string, { border: string; badge: string; text: string }> = {
    high:   { border: "border-l-red-400",    badge: "bg-red-100",    text: "text-red-500" },
    medium: { border: "border-l-yellow-400", badge: "bg-yellow-100", text: "text-yellow-600" },
    low:    { border: "border-l-blue-400",   badge: "bg-blue-100",   text: "text-blue-500" },
}

interface TaskCardProps {
    task: Task
    assignee: ProjectApplicant | undefined
}

export function TaskCard({ task, assignee }: TaskCardProps) {
    const { ref } = useDraggable({ id: task.id })
    const style = priorityStyles[task.priority] ?? priorityStyles.medium

    return (
        <div ref={ref} className={`bg-white border-l-6 ${style.border} border border-slate-100 rounded-xl p-3 shadow-sm flex flex-col gap-2 cursor-grab active:cursor-grabbing`}>
            <Badge className={`w-fit ${style.badge} ${style.text} px-3 py-1 uppercase font-semibold text-xs`}>
                {task.priority}
            </Badge>
            <p className="text-sm font-semibold text-slate-800">{task.title}</p>
            <Separator />
            <div className="flex items-center justify-between">
                {assignee ? (
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 text-xs flex items-center justify-center font-medium">
                            {assignee.first_name[0]}
                        </div>
                        <span className="text-xs text-slate-400">{assignee.first_name}</span>
                    </div>
                ) : (
                    <span className="text-xs text-slate-300 italic">Unassigned</span>
                )}
                {task.due_date && (
                    <span className="text-xs text-slate-400">Due {task.due_date.slice(0, 10)}</span>
                )}
            </div>
        </div>
    )
}
