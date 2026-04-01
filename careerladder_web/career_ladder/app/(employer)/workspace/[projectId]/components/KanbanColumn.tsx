"use client"

import { Task, ProjectApplicant } from "@/types"
import { useDroppable } from "@dnd-kit/react"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { ClipboardList } from "lucide-react"
import { TaskCard } from "./TaskCard"

const columnStyles: Record<string, { header: string; label: string }> = {
    todo:        { header: "bg-gray-200",  label: "To Do" },
    in_progress: { header: "bg-blue-200",  label: "In Progress" },
    review:      { header: "bg-amber-200", label: "In Review" },
    done:        { header: "bg-green-200", label: "Done" },
}

interface KanbanColumnProps {
    colId: string
    colTasks: Task[]
    projectApplicants: ProjectApplicant[]
}

function DroppableArea({ id, children }: { id: string; children: React.ReactNode }) {
    const { ref } = useDroppable({ id })
    return <div ref={ref} className="flex flex-col gap-5 p-4 min-h-24">{children}</div>
}

export function KanbanColumn({ colId, colTasks, projectApplicants }: KanbanColumnProps) {
    const { header, label } = columnStyles[colId]

    return (
        <div className="w-130 border rounded-2xl">
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
                    colTasks.map((task) => {
                        const assignee = projectApplicants.find(a => a.clerk_id === task.assigned_to)
                        return <TaskCard key={task.id} task={task} assignee={assignee} />
                    })
                )}
            </DroppableArea>
        </div>
    )
}
