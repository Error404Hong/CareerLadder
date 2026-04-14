"use client"

import { useState } from "react"
import { DragDropProvider } from "@dnd-kit/react"
import { Task, ProjectApplicant } from "@/types"
import { moveTask, createTask } from "@/app/api/task"
import { toast } from "sonner"
import { format } from "date-fns"

import { KanbanColumn } from "./KanbanColumn"
import { CreateTaskDialog, CreateTaskFormValues } from "./CreateTaskDialog"

interface KanbanBoardProps {
    tasks: Task[]
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>
    projectApplicants: ProjectApplicant[]
    projectId: string
    readOnly?: boolean
}

export function KanbanBoard({ tasks, setTasks, projectApplicants, projectId, readOnly = false }: KanbanBoardProps) {

    const [openDialog, setOpenDialog] = useState(false)
    const [selectedColumn, setSelectedColumn] = useState("todo")

    const columns = {
        todo: tasks.filter(t => t.board_column === "todo"),
        in_progress: tasks.filter(t => t.board_column === "in_progress"),
        review: tasks.filter(t => t.board_column === "review"),
        done: tasks.filter(t => t.board_column === "done"),
    }

    const handleAddTask = (colId: string) => {
        setSelectedColumn(colId)
        setOpenDialog(true)
    }

    const onSubmit = async (values: CreateTaskFormValues) => {
        console.log("Submitting: ", values)

        try {
            const addTaskRes = await createTask(
                projectId,
                values.title,
                values.description,
                values.assigned_to,
                values.board_column,
                values.priority,
                format(values.due_date, "yyyy-MM-dd"),
            )

            if (addTaskRes.success) {
                setTasks(prev => [...prev, addTaskRes.data])
                toast.success("Task has been created successfully");
            } else {
                toast.error("Failed to add new task. Please try again")
            }
        } catch {
            toast.error("Something went wrong. Please try again");
        } finally {
            setOpenDialog(false);
        }
    }

    return (
        <>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                    {Object.entries(columns).map(([colId, colTasks]) => (
                        <KanbanColumn
                            key={colId}
                            colId={colId}
                            colTasks={colTasks}
                            projectApplicants={projectApplicants}
                            onAddTask={readOnly ? undefined : (colId) => handleAddTask(colId)}
                            onTaskDeleted={(taskId) => setTasks(prev => prev.filter(t => t.id !== taskId))}
                            onTaskUpdated={(updated) => setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))}
                        />
                    ))}
                </div>
            </DragDropProvider>

            {!readOnly && (
                <CreateTaskDialog
                    open={openDialog}
                    onOpenChange={setOpenDialog}
                    projectApplicants={projectApplicants}
                    defaultColumn={selectedColumn}
                    onSubmit={onSubmit}
                />
            )}
        </>
    )
}
