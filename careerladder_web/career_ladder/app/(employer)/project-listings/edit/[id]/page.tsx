"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { format, addMonths } from "date-fns"

import { Plus, X, CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { getProjectById, updateProject } from "@/app/api/project"

const formSchema = z.object({
    title: z.string().min(1, "Project title cannot be empty"),
    description: z.string().min(20, "Please provide a detailed project description"),
    skills_required: z.array(z.string()).min(1, "Please add at least one skill"),
    duration_months: z.number().min(1, "Duration must be at least 1 month"),
    allowance: z.number().min(0, "Allowance must be 0 or more"),
    vacancies: z.number().optional(),
    start_date: z.date({ message: "Start date is required" }),
    end_date: z.date({ message: "End date is required" }),
    status: z.string().min(1, "Status is required"),
})

type FormValues = z.infer<typeof formSchema>

// parse existing duration string from DB to months number
const parseDurationToMonths = (duration: string): number => {
    const lower = duration.toLowerCase()
    const monthMatch = lower.match(/(\d+)\s*month/)
    if (monthMatch) return parseInt(monthMatch[1])
    return 1
}

export default function EditProject() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [skillInput, setSkillInput] = useState("")

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            skills_required: [],
            duration_months: 1,
            allowance: 0,
            vacancies: 1,
            status: "open",
        }
    })

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const fetchRes = await getProjectById(id)
                if (fetchRes.success) {
                    const p = fetchRes.data
                    form.reset({
                        title: p.title ?? "",
                        description: p.description ?? "",
                        skills_required: p.skills_required ?? [],
                        duration_months: parseDurationToMonths(p.duration ?? "1 month"),
                        allowance: Number(p.allowance) || 0,
                        vacancies: p.vacancies ?? 1,
                        start_date: p.start_date ? new Date(p.start_date) : undefined,
                        end_date: p.end_date ? new Date(p.end_date) : undefined,
                        status: p.status ?? "open",
                    })
                } else {
                    toast.error("Failed to fetch project. Please try again")
                }
            } finally {
                setIsLoading(false)
            }
        }
        fetchProject()
    }, [id, form])

    const handleAddSkill = () => {
        const trimmed = skillInput.trim()
        if (!trimmed) return
        const current = form.getValues("skills_required")
        if (current.includes(trimmed)) return
        form.setValue("skills_required", [...current, trimmed])
        setSkillInput("")
    }

    const handleRemoveSkill = (skill: string) => {
        const current = form.getValues("skills_required")
        form.setValue("skills_required", current.filter(s => s !== skill))
    }

    const handleDurationChange = (months: number) => {
        form.setValue("duration_months", months)
        const startDate = form.getValues("start_date")
        if (startDate && months >= 1) {
            form.setValue("end_date", addMonths(startDate, months))
        }
    }

    const handleStartDateChange = (date: Date | undefined) => {
        if (!date) return
        form.setValue("start_date", date)
        const months = form.getValues("duration_months")
        if (months >= 1) {
            form.setValue("end_date", addMonths(date, months))
        }
    }

    const handleSubmit = async (values: FormValues) => {
        setIsSubmitting(true)
        try {
            const duration = `${values.duration_months} month${values.duration_months > 1 ? "s" : ""}`
            const res = await updateProject(
                id,
                values.title,
                values.description,
                values.skills_required,
                duration,
                values.allowance,
                values.vacancies ?? 0,
                values.start_date.toISOString(),
                values.end_date.toISOString(),
                values.status,
            )
            if (res.success) {
                toast.success("Project has been updated successfully")
                router.push("/project-listings")
            } else {
                toast.error("Failed to update project. Please try again")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">
                <Skeleton className="h-4 w-64 rounded" />
                <div className="flex flex-col gap-5">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/project-listings">Project Listings</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Edit Project</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <form id="project-form" onSubmit={form.handleSubmit(handleSubmit)}>
                    <div className="flex flex-col gap-5">

                        {/* Basic Info */}
                        <Card className="rounded-lgborder border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-grey-300">
                                <CardTitle className="text-base font-semibold">Basic Information</CardTitle>
                                <CardDescription>Update the basic details about the project.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-6 py-3">
                                <FieldGroup className="gap-5">

                                    {/* Title */}
                                    <Controller name="title" control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <Label htmlFor="title">Project Title</Label>
                                                <Input {...field} id="title" placeholder="e.g. AI Chatbot Integration" aria-invalid={fieldState.invalid} />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    {/* Duration + Vacancies */}
                                    <Field className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Controller name="duration_months" control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <Label htmlFor="duration_months">Duration (Months)</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            {...field}
                                                            id="duration_months"
                                                            type="number"
                                                            min={1}
                                                            placeholder="e.g. 3"
                                                            value={isNaN(field.value) || field.value === 0 ? "" : field.value}
                                                            onChange={(e) => {
                                                                const val = e.target.value === "" ? 1 : Number(e.target.value)
                                                                handleDurationChange(val)
                                                            }}
                                                            aria-invalid={fieldState.invalid}
                                                        />
                                                        <span className="text-sm text-slate-400 shrink-0">month{field.value > 1 ? "s" : ""}</span>
                                                    </div>
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                        <Controller name="vacancies" control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <Label htmlFor="vacancies">Vacancies</Label>
                                                    <Input
                                                        {...field}
                                                        id="vacancies"
                                                        type="number"
                                                        placeholder="e.g. 2"
                                                        value={field.value === 0 ? "" : field.value}
                                                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                                        aria-invalid={fieldState.invalid}
                                                    />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                    </Field>

                                    {/* Allowance + Status */}
                                    <Field className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Controller name="allowance" control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <Label htmlFor="allowance">Monthly Allowance (RM)</Label>
                                                    <Input
                                                        {...field}
                                                        id="allowance"
                                                        type="number"
                                                        placeholder="e.g. 1200"
                                                        value={isNaN(field.value) || field.value === 0 ? "" : field.value}
                                                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                                        aria-invalid={fieldState.invalid}
                                                    />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                        <Controller name="status" control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <Label>Status</Label>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="open">Open</SelectItem>
                                                            <SelectItem value="closed">Closed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                    </Field>

                                    {/* Start Date + End Date */}
                                    <Field className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Controller name="start_date" control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <Label>Start Date</Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className={cn(
                                                                    "w-full flex items-center gap-2 px-3 h-9 rounded-md border border-input text-sm text-left",
                                                                    !field.value && "text-slate-400"
                                                                )}
                                                            >
                                                                <CalendarIcon size={13} className="text-slate-400 shrink-0" />
                                                                {field.value ? format(field.value, "d MMM yyyy") : "Pick a date"}
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={handleStartDateChange}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                        <Controller name="end_date" control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <Label>End Date</Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className={cn(
                                                                    "w-full flex items-center gap-2 px-3 h-9 rounded-md border border-input text-sm text-left",
                                                                    !field.value && "text-slate-400"
                                                                )}
                                                            >
                                                                <CalendarIcon size={13} className="text-slate-400 shrink-0" />
                                                                {field.value ? format(field.value, "d MMM yyyy") : "Auto calculated"}
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
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
                            </CardContent>
                        </Card>

                        {/* Skills */}
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-grey-300">
                                <CardTitle className="text-base font-semibold">Skills Required</CardTitle>
                                <CardDescription>Add the skills candidates need for this project.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-6 py-3">
                                <Controller name="skills_required" control={form.control}
                                    render={({ fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <div className="flex gap-2 mb-3">
                                                <Input
                                                    value={skillInput}
                                                    onChange={(e) => setSkillInput(e.target.value)}
                                                    placeholder="e.g. Python, FastAPI..."
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault()
                                                            handleAddSkill()
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="cursor-pointer shrink-0"
                                                    onClick={handleAddSkill}
                                                >
                                                    <Plus size={14} /> Add
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {form.watch("skills_required").map((skill) => (
                                                    <Badge key={skill} variant="secondary" className="px-3 py-1.5 text-sm gap-1.5">
                                                        {skill}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveSkill(skill)}
                                                            className="hover:text-red-500 transition-colors cursor-pointer"
                                                        >
                                                            <X size={11} />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Description */}
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-grey-300">
                                <CardTitle className="text-base font-semibold">Project Details</CardTitle>
                                <CardDescription>Describe the project and what you expect from candidates.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-6 py-3">
                                <FieldGroup className="gap-5">
                                    <Controller name="description" control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <Label htmlFor="description">Project Description</Label>
                                                <Textarea
                                                    {...field}
                                                    id="description"
                                                    rows={5}
                                                    placeholder="Describe the project, objectives, and what the candidate will be working on..."
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                </FieldGroup>
                            </CardContent>
                        </Card>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="cursor-pointer p-5"
                                onClick={() => router.push("/project-listings")}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                form="project-form"
                                disabled={isSubmitting}
                                className="cursor-pointer p-5"
                            >
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    )
}