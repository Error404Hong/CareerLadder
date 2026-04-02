"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"

import { Task, ProjectApplicant } from "@/types"
import { updateTask } from "@/app/api/task"
import { toast } from "sonner"

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    assigned_to: z.string().min(1, "Task must be assigned to a member"),
    title: z.string().min(1, "Task title cannot be empty"),
    description: z.string().min(1, "Task description cannot be empty"),
    board_column: z.string().min(1, "Board column cannot be empty"),
    priority: z.string().min(1, "Task priority cannot be empty"),
    due_date: z.date({ message: "Due date cannot be empty" }),
})

type EditTaskFormValues = z.infer<typeof formSchema>

interface EditTaskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    task: Task
    projectApplicants: ProjectApplicant[]
    onTaskUpdated: (updated: Task) => void
    mode?: "view" | "edit"
}

export function EditTaskDialog({ open, onOpenChange, task, projectApplicants, onTaskUpdated, mode = "edit" }: EditTaskDialogProps) {

    const isView = mode === "view"

    const form = useForm<EditTaskFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            assigned_to: task.assigned_to ?? "",
            title: task.title,
            description: task.description ?? "",
            board_column: task.board_column,
            priority: task.priority,
            due_date: task.due_date
                ? (() => { const d = new Date(task.due_date!); return new Date(d.getFullYear(), d.getMonth(), d.getDate()) })()
                : undefined,
        }
    })

    const handleOpenChange = (open: boolean) => {
        onOpenChange(open)
    }

    const handleSubmit = async (values: EditTaskFormValues) => {
        try {
            const res = await updateTask(
                task.id,
                values.title,
                values.description,
                values.assigned_to,
                values.board_column,
                values.priority,
                format(new Date(values.due_date.getFullYear(), values.due_date.getMonth(), values.due_date.getDate()), "yyyy-MM-dd"),
            )

            if (res.success) {
                onTaskUpdated(res.data)
                toast.success("Task updated successfully")
                onOpenChange(false)
            } else {
                toast.error("Failed to update task. Please try again")
            }
        } catch {
            toast.error("Something went wrong. Please try again")
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <form id="edit-task-form" onSubmit={form.handleSubmit(handleSubmit)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{isView ? "View Task" : "Edit Task"}</DialogTitle>
                        <DialogDescription>
                            {isView ? "Task details are shown below." : "Update the task details below."}
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup>
                        {/* Title */}
                        <Controller name="title" control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <Label htmlFor="edit-title">Title</Label>
                                    <Input {...field} id="edit-title" placeholder="Task title" aria-invalid={fieldState.invalid} disabled={isView} />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        {/* Description */}
                        <Controller name="description" control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <Label htmlFor="edit-description">Description</Label>
                                    <Textarea {...field} id="edit-description" placeholder="Describe the task..." rows={3} aria-invalid={fieldState.invalid} disabled={isView} />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        {/* Assign To + Priority */}
                        <Field className="grid grid-cols-1 sm:grid-cols-2">
                            <Controller name="assigned_to" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label>Assign To</Label>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isView}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select member" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {projectApplicants.map((a) => (
                                                    <SelectItem key={a.clerk_id} value={a.clerk_id}>
                                                        {a.first_name} {a.last_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller name="priority" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label>Priority</Label>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isView}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="low">Low</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </Field>

                        {/* Column + Due Date */}
                        <Field className="grid grid-cols-1 sm:grid-cols-2">
                            <Controller name="board_column" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label>Column</Label>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isView}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select column" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="todo">To Do</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="review">In Review</SelectItem>
                                                <SelectItem value="done">Done</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller name="due_date" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label>Due Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild disabled={isView}>
                                                <Button
                                                    variant="outline"
                                                    disabled={isView}
                                                    className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(field.value, "PPP") : "Pick a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    autoFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </Field>
                    </FieldGroup>

                    <DialogFooter className="mt-3">
                        <DialogClose asChild>
                            <Button variant="outline" className="cursor-pointer">Close</Button>
                        </DialogClose>
                        {isView ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span tabIndex={0}>
                                        <Button type="button" disabled className="cursor-not-allowed">
                                            Save Changes
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Switch to edit mode to make changes</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Button type="submit" form="edit-task-form" className="cursor-pointer">
                                Save Changes
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
