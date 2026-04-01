"use client"

import { Task, ProjectApplicant } from "@/types"
import { DragDropProvider } from "@dnd-kit/react"
import { KanbanColumn } from "./KanbanColumn"

interface KanbanBoardProps {
    tasks: Task[]
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>
    projectApplicants: ProjectApplicant[]
}

export function KanbanBoard({ tasks, setTasks, projectApplicants }: KanbanBoardProps) {
    const columns = {
        todo:        tasks.filter(t => t.board_column === "todo").sort((a, b) => a.position - b.position),
        in_progress: tasks.filter(t => t.board_column === "in_progress").sort((a, b) => a.position - b.position),
        review:      tasks.filter(t => t.board_column === "review").sort((a, b) => a.position - b.position),
        done:        tasks.filter(t => t.board_column === "done").sort((a, b) => a.position - b.position),
    }

    return (
        <DragDropProvider
            onDragEnd={({ operation }) => {
                const { source, target } = operation
                if (!source || !target) return

                const draggedTask = tasks.find(t => t.id === source.id)
                if (!draggedTask) return

                const targetColumn = target.id as Task["board_column"]

                if (draggedTask.board_column !== targetColumn) {
                    setTasks(prev => prev.map(t =>
                        t.id === draggedTask.id ? { ...t, board_column: targetColumn } : t
                    ))
                }
            }}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                {Object.entries(columns).map(([colId, colTasks]) => (
                    <KanbanColumn
                        key={colId}
                        colId={colId}
                        colTasks={colTasks}
                        projectApplicants={projectApplicants}
                    />
                ))}
            </div>
        </DragDropProvider>
    )
}
