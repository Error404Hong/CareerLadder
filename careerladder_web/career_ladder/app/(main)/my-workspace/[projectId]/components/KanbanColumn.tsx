"use client"

import { Task } from "@/types"
import { useDroppable } from "@dnd-kit/react"
import { ClipboardList } from "lucide-react"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { TaskCard } from "./TaskCard"

const columnStyles: Record<string, { header: string; label: string }> = {
    todo: { header: "bg-gray-200", label: "To Do" },
    in_progress: { header: "bg-blue-200", label: "In Progress" },
    review: { header: "bg-amber-200", label: "In Review" },
    done: { header: "bg-green-200", label: "Done" },
}

interface KanbanColumnProps {
    colId: string
    colTasks: Task[]
}

function DroppableArea({ id, children }: { id: string; children: React.ReactNode }) {
    const { ref } = useDroppable({ id })
    return <div ref={ref} className="flex flex-col gap-3 p-3 min-h-24">{children}</div>
}

export function KanbanColumn({ colId, colTasks }: KanbanColumnProps) {
    const { header, label } = columnStyles[colId]

    return (
        <div className="border rounded-2xl w-full">
            <div className={`flex items-center gap-2 ${header} p-4 rounded-t-2xl`}>
                <p className="text-sm font-semibold uppercase">{label} | {colTasks.length}</p>
            </div>

            <DroppableArea id={colId}>
                {colTasks.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="default" className="bg-transparent">
                                <ClipboardList />
                            </EmptyMedia>
                            <EmptyTitle className="text-sm font-semibold">No tasks</EmptyTitle>
                            <EmptyDescription className="text-[12px]">No tasks in this column yet</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    colTasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))
                )}
            </DroppableArea>
        </div>
    )
}
