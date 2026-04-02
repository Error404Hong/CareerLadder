"use client"

import { Task } from "@/types"
import { useState } from "react"
import { deleteTask } from "@/app/api/task"
import { toast } from "sonner"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteTaskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    task: Task | null
    onTaskDeleted: (taskId: string) => void
}

export function DeleteTaskDialog({ open, onOpenChange, task, onTaskDeleted }: DeleteTaskDialogProps) {

    const onDelete = async () => {
        if (!task) return

        try {
            const deleteRes = await deleteTask(task.id)

            if (deleteRes.success) {
                onTaskDeleted(task.id)
                toast.success("Task has been deleted successfully")
            } else {
                toast.error("Failed to delete task. Please try again")
            }
        } catch {
            toast.error("Something went wrong. Please try again")
        } finally {
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Task</DialogTitle>
                    <DialogDescription>
                        Are you certain to delete <span className="font-semibold">{task?.title}</span>? This action cannot be undone.
                    </DialogDescription>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" className="cursor-pointer">Cancel</Button>
                        </DialogClose>
                        <Button className="cursor-pointer bg-red-500 hover:bg-red-600" onClick={onDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
