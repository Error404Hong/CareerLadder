"use client"

import { useState } from "react"
import Image from "next/image"
import { Task, ProjectApplicant } from "@/types"
import { useDraggable } from "@dnd-kit/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Eye, Pencil, Trash2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { DeleteTaskDialog } from "./DeleteTaskDialog"
import { EditTaskDialog } from "./EditTaskDialog"

const priorityStyles: Record<string, { border: string; badge: string; text: string }> = {
    high: { border: "border-l-red-400", badge: "bg-red-100", text: "text-red-500" },
    medium: { border: "border-l-yellow-400", badge: "bg-yellow-100", text: "text-yellow-600" },
    low: { border: "border-l-blue-400", badge: "bg-blue-100", text: "text-blue-500" },
}

interface TaskCardProps {
    task: Task
    assignee: ProjectApplicant | undefined
    index: number
    projectApplicants: ProjectApplicant[]
    onTaskDeleted: (taskId: string) => void
    onTaskUpdated: (updated: Task) => void
}

export function TaskCard({ task, assignee, index, projectApplicants, onTaskDeleted, onTaskUpdated }: TaskCardProps) {
    const { ref } = useDraggable({ id: task.id })
    const style = priorityStyles[task.priority] ?? priorityStyles.medium

    const [openDelDialog, setOpenDelDialog] = useState(false)
    const [openViewDialog, setOpenViewDialog] = useState(false)
    const [openEditDialog, setOpenEditDialog] = useState(false)

    return (
        <>
            <div ref={ref} className={`bg-white border-l-6 ${style.border} border border-slate-100 rounded-xl p-3 shadow-sm flex flex-col gap-2 cursor-grab active:cursor-grabbing`}>
                <Badge className={`w-fit ${style.badge} ${style.text} px-3 py-1 uppercase font-semibold text-xs`}>
                    {task.priority}
                </Badge>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">{task.title}</p>
                    </div>

                    <div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" className="cursor-pointer text-slate-600 h-7 w-7 p-0"
                                    onClick={() => setOpenViewDialog(true)}
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>View Task Detail</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" className="cursor-pointer text-slate-600 hover:text-blue-400 h-7 w-7 p-0"
                                    onClick={() => setOpenEditDialog(true)}
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Edit Task</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" className="cursor-pointer text-slate-600 hover:text-red-400 h-7 w-7 p-0"
                                    onClick={() => setOpenDelDialog(true)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Delete Task</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                <Separator />
                <div className="flex items-center justify-between">
                    {assignee ? (
                        <div className="flex items-center gap-1.5">
                            <div className="w-7.5 h-7.5 rounded-full overflow-hidden shrink-0">
                                <Image
                                    src={assignee.profile_image}
                                    height={30}
                                    width={30}
                                    alt="Member Profile"
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <span className="text-xs text-slate-400">{assignee.first_name}</span>
                        </div>
                    ) : (
                        <span className="text-xs text-slate-300 italic">Unassigned</span>
                    )}
                    {task.due_date && (
                        <span className="text-xs text-slate-400">Due {new Date(task.due_date).toLocaleDateString("en-CA")}</span>
                    )}
                </div>
            </div>

            <DeleteTaskDialog
                open={openDelDialog}
                onOpenChange={setOpenDelDialog}
                task={task}
                onTaskDeleted={onTaskDeleted}
            />

            {openViewDialog && (
                <EditTaskDialog
                    open={openViewDialog}
                    onOpenChange={setOpenViewDialog}
                    task={task}
                    projectApplicants={projectApplicants}
                    onTaskUpdated={onTaskUpdated}
                    mode="view"
                />
            )}

            {openEditDialog && (
                <EditTaskDialog
                    open={openEditDialog}
                    onOpenChange={setOpenEditDialog}
                    task={task}
                    projectApplicants={projectApplicants}
                    onTaskUpdated={onTaskUpdated}
                    mode="edit"
                />
            )}
        </>
    )
}
