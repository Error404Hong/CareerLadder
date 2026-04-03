"use client"

import { useState } from "react"
import { Task } from "@/types"
import { useDraggable } from "@dnd-kit/react"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, EllipsisVertical } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ViewTaskDialog } from "./ViewTaskDialog"

const priorityStyles: Record<string, { border: string; badge: string; text: string; dot: string }> = {
    high: { border: "border-l-red-400", badge: "bg-red-100", text: "text-red-500", dot: "bg-red-400" },
    medium: { border: "border-l-amber-400", badge: "bg-amber-100", text: "text-amber-600", dot: "bg-amber-400" },
    low: { border: "border-l-blue-400", badge: "bg-blue-100", text: "text-blue-500", dot: "bg-blue-400" },
}

interface TaskCardProps {
    task: Task
}

export function TaskCard({ task }: TaskCardProps) {
    const { ref } = useDraggable({ id: task.id })
    const style = priorityStyles[task.priority] ?? priorityStyles.medium
    const [openView, setOpenView] = useState(false)

    return (
        <>
            <div ref={ref} className={`bg-white border-l-4 ${style.border} border border-slate-100 rounded-lg p-3 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow duration-150 cursor-grab active:cursor-grabbing`}>
                <div className="flex justify-between items-center">
                    <div><p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">{task.title}</p></div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="cursor-pointer hover:bg-slate-100 rounded-full p-1"><EllipsisVertical size={13} /></div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-38">
                            <DropdownMenuGroup>
                                <DropdownMenuItem className="cursor-pointer text-sm" onSelect={() => setOpenView(true)}>
                                    View Task Details
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {task.description && (
                    <p className="text-xs text-slate-400 leading-snug line-clamp-2">{task.description}</p>
                )}
                <div className="flex items-center justify-between gap-1">
                    <Badge className={`${style.badge} ${style.text} px-2 py-1 uppercase font-semibold text-[10px] shadow-none rounded-full`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${style.dot} mr-1`} />
                        {task.priority}
                    </Badge>
                    {task.due_date && (
                        <div className="flex items-center gap-1 mt-0.5">
                            <CalendarDays className="h-3 w-3 text-slate-300" />
                            <span className="text-[11px] text-slate-400">
                                {new Date(task.due_date).toLocaleDateString("en-CA")}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <ViewTaskDialog open={openView} onOpenChange={setOpenView} task={task} />
        </>
    )
}
