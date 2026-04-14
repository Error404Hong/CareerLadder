"use client"

import { Task } from "@/types"
import { DragDropProvider } from "@dnd-kit/react"
import { moveTask } from "@/app/api/task"
import { toast } from "sonner"
import { KanbanColumn } from "./KanbanColumn"

interface KanbanBoardProps {
    tasks: Task[]
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>
    readOnly?: boolean
}

export function KanbanBoard({ tasks, setTasks, readOnly = false }: KanbanBoardProps) {
    const columns = {
        todo: tasks.filter(t => t.board_column === "todo"),
        in_progress: tasks.filter(t => t.board_column === "in_progress"),
        review: tasks.filter(t => t.board_column === "review"),
        done: tasks.filter(t => t.board_column === "done"),
    }

    return (
        <DragDropProvider
            onDragEnd={({ operation }) => {
                if (readOnly) return
                const { source, target } = operation
                if (!source || !target) return

                const draggedTask = tasks.find(t => t.id === source.id)
                if (!draggedTask) return

                const targetColumn = target.id as Task["board_column"]

                if (draggedTask.board_column !== targetColumn) {
                    setTasks(prev => prev.map(t =>
                        t.id === draggedTask.id ? { ...t, board_column: targetColumn } : t
                    ))

                    moveTask(draggedTask.id, targetColumn).catch(() => {
                        setTasks(prev => prev.map(t =>
                            t.id === draggedTask.id ? { ...t, board_column: draggedTask.board_column } : t
                        ))
                        toast.error("Failed to move task. Please try again.")
                    })
                }
            }}
        >
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
                {Object.entries(columns).map(([colId, colTasks]) => (
                    <KanbanColumn
                        key={colId}
                        colId={colId}
                        colTasks={colTasks}
                    />
                ))}
            </div>
        </DragDropProvider>
    )
}
