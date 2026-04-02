"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { ProjectApplicant } from "@/types"

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    assigned_to: z.string().min(1, "Task must be assigned to a member"),
    title: z.string().min(1, "Task title cannot be empty"),
    description: z.string().min(1, "Task description cannot be empty"),
    board_column: z.string().min(1, "Board column cannot be empty"),
    priority: z.string().min(1, "Task priority cannot be empty"),
    due_date: z.date({ message: "Due date cannot be empty" }),
})

export type CreateTaskFormValues = z.infer<typeof formSchema>

interface CreateTaskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectApplicants: ProjectApplicant[]
    defaultColumn: string
    onSubmit: (values: CreateTaskFormValues) => void
}

export function CreateTaskDialog({ open, onOpenChange, projectApplicants, defaultColumn, onSubmit }: CreateTaskDialogProps) {

    const form = useForm<CreateTaskFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            assigned_to: "",
            title: "",
            description: "",
            board_column: defaultColumn,
            priority: "",
        }
    })

    const handleOpenChange = (open: boolean) => {
        if (!open) form.reset()
        onOpenChange(open)
    }

    const handleSubmit = (values: CreateTaskFormValues) => {
        onSubmit(values)
        form.reset()
    }

    // Sync board_column when a different column's + button is clicked
    useEffect(() => {
        form.setValue("board_column", defaultColumn)
    }, [defaultColumn, form])

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <form id="create-task-form" onSubmit={form.handleSubmit(handleSubmit)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add New Task</DialogTitle>
                        <DialogDescription>
                            Create a task and organize it on your kanban board to track progress efficiently.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup>
                        {/* Title */}
                        <Controller name="title" control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <Label htmlFor="title">Title</Label>
                                    <Input {...field} id="title" placeholder="Task title" aria-invalid={fieldState.invalid} />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        {/* Description */}
                        <Controller name="description" control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea {...field} id="description" placeholder="Describe the task..." rows={3} aria-invalid={fieldState.invalid} />
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
                                        <Select onValueChange={field.onChange} value={field.value}>
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
                                        <Select onValueChange={field.onChange} value={field.value}>
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
                                        <Select onValueChange={field.onChange} value={field.value}>
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
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
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
                                                    disabled={(date) => date < new Date()}
                                                    initialFocus
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
                            <Button variant="outline" className="cursor-pointer">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" form="create-task-form" className="cursor-pointer">
                            Create Task
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
