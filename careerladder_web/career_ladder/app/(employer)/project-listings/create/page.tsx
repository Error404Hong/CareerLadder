"use client"

import { useUser } from "@clerk/nextjs"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { format, addMonths } from "date-fns"

import { Plus, X, CalendarIcon, CircleHelp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Field, FieldGroup, FieldError, FieldContent, FieldTitle } from "@/components/ui/field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createProject } from "@/app/api/project"
import { Checkbox } from "@/components/ui/checkbox"
import { TermsDialog } from "./termsDialog"

const formSchema = z.object({
    title: z.string().min(1, "Project title cannot be empty"),
    description: z.string().min(20, "Please provide a detailed project description"),
    skills_required: z.array(z.string()).min(1, "Please add at least one skill"),
    duration_months: z.number().min(1, "Duration must be at least 1 month"),
    allowance: z.number().min(0, "Allowance must be 0 or more"),
    vacancies: z.number().min(1, "At least 1 vacancy is required"),
    start_date: z.date({ message: "Start date is required" }),
    end_date: z.date({ message: "End date is required" }),
    rewards_acknowledged: z.boolean().refine(val => val === true, { message: "You must agree before publishing." }),
})

type FormValues = z.infer<typeof formSchema>

export default function CreateProject() {
    const { user } = useUser()
    const router = useRouter()
    const [skillInput, setSkillInput] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [termsOpen, setTermsOpen] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            skills_required: [],
            duration_months: 1,
            allowance: 0,
            vacancies: 1,
            rewards_acknowledged: false,
        }
    })

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
            const res = await createProject(
                user!.id,
                values.title,
                values.description,
                values.skills_required,
                duration,
                values.allowance,
                values.vacancies,
                values.start_date.toISOString(),
                values.end_date.toISOString(),
            )
            if (res.success) {
                toast.success("Project has been successfully created and distributed")
                form.reset()
            } else {
                toast.error("Failed to create project. Please try again")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

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
                            <BreadcrumbPage>Create New Project</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <form id="project-form" onSubmit={form.handleSubmit(handleSubmit)}>
                    <div className="flex flex-col gap-5">

                        {/* Basic Info */}
                        <Card className="rounded-lgborder border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-grey-300">
                                <CardTitle className="text-base font-semibold">Basic Information</CardTitle>
                                <CardDescription>Provide the basic details about the project.</CardDescription>
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
                                                        value={isNaN(field.value) || field.value === 0 ? "" : field.value}
                                                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                                        aria-invalid={fieldState.invalid}
                                                    />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                    </Field>

                                    {/* Allowance */}
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
                        <Controller name="rewards_acknowledged" control={form.control}
                            render={({ field, fieldState }) => (
                                <div className="flex items-start justify-between gap-6">
                                    <Field orientation="horizontal" data-invalid={fieldState.invalid} className="flex-1">
                                        <Checkbox
                                            id="terms-checkbox"
                                            checked={field.value}
                                            onCheckedChange={(val) => field.onChange(val === true)}
                                        />
                                        <FieldContent>
                                            <FieldTitle>
                                                <div className="flex items-center gap-1.5">
                                                    <Label htmlFor="terms-checkbox" className="text-sm font-normal leading-snug">
                                                        By creating this project, I agree to award badges, XP, and a certificate to accepted students upon completion.
                                                    </Label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setTermsOpen(true)}
                                                        className="text-slate-400 hover:text-[#2563eb] transition-colors shrink-0 cursor-pointer"
                                                    >
                                                        <CircleHelp size={14} />
                                                    </button>
                                                </div>
                                            </FieldTitle>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </FieldContent>
                                    </Field>
                                    <div className="flex items-center gap-3 shrink-0">
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
                                            {isSubmitting ? "Publishing..." : "Publish Project"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        />

                    </div>
                </form>
            </div>

            <TermsDialog open={termsOpen} onOpenChange={setTermsOpen} />
        </div>
    )
}