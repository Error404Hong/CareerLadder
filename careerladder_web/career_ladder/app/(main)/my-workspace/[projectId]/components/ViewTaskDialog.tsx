"use client"

import { Task } from "@/types"
import { CalendarDays, AlignLeft, LayoutGrid, Flag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const priorityStyles: Record<string, { badge: string; text: string; dot: string }> = {
    high: { badge: "bg-red-100", text: "text-red-500", dot: "bg-red-400" },
    medium: { badge: "bg-amber-100", text: "text-amber-600", dot: "bg-amber-400" },
    low: { badge: "bg-blue-100", text: "text-blue-500", dot: "bg-blue-400" },
}

const columnLabels: Record<string, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    review: "In Review",
    done: "Done",
}

interface ViewTaskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    task: Task
}

export function ViewTaskDialog({ open, onOpenChange, task }: ViewTaskDialogProps) {
    const style = priorityStyles[task.priority] ?? priorityStyles.medium

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base">{task.title}</DialogTitle>
                    <DialogDescription>Task details assigned to you.</DialogDescription>
                </DialogHeader>

                <Separator />

                <div className="flex flex-col gap-4 py-1">
                    {/* Description */}
                    <div className="flex gap-3">
                        <AlignLeft className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <div className="flex flex-col gap-1">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</p>
                            <p className="text-sm text-slate-700 leading-relaxed">
                                {task.description ?? <span className="italic text-slate-400">No description provided.</span>}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Priority + Column */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex gap-3 items-start">
                            <Flag className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                            <div className="flex flex-col gap-1">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Priority</p>
                                <Badge className={`w-fit ${style.badge} ${style.text} px-2 py-0.5 text-[10px] uppercase font-semibold shadow-none rounded-full`}>
                                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${style.dot} mr-1`} />
                                    {task.priority}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start">
                            <LayoutGrid className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                            <div className="flex flex-col gap-1">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</p>
                                <p className="text-sm text-slate-700">{columnLabels[task.board_column] ?? task.board_column}</p>
                            </div>
                        </div>
                    </div>

                    {/* Due Date */}
                    {task.due_date && (
                        <>
                            <Separator />
                            <div className="flex gap-3 items-start">
                                <CalendarDays className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Due Date</p>
                                    <p className="text-sm text-slate-700">
                                        {new Date(task.due_date).toLocaleDateString("en-CA")}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" className="cursor-pointer">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
