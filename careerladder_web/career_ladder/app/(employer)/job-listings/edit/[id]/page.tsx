"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { getJobById, updateJob } from "@/app/api/job"
import { Job } from "@/types"

import { toast } from "sonner"
import { Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const employmentTypes = [
    { value: "fulltime", label: "Full Time" },
    { value: "parttime", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "freelance", label: "Freelance" },
]

const formSchema = z.object({
    title: z.string().min(1, "Job title cannot be empty"),
    description: z.string().min(20, "Please provide a detailed job description"),
    requirements: z.string().min(10, "Please provide job requirements"),
    skills_required: z.array(z.string()).min(1, "Please add at least one skill"),
    employment_type: z.string().min(1, "Employment type is required"),
    salary_min: z.number().min(1, "Minimum salary is required"),
    salary_max: z.number().min(1, "Maximum salary is required"),
    location: z.string().min(1, "Location is required"),
    is_remote: z.boolean(),
    vacancies: z.number().min(1, "At least 1 vacancy is required"),
}).refine(data => data.salary_max >= data.salary_min, {
    message: "Maximum salary must be greater than minimum salary",
    path: ["salary_max"]
})

type FormValues = z.infer<typeof formSchema>

export default function EditJob() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [jobData, setJobData] = useState<Job | null>(null)
    const [skillInput, setSkillInput] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            requirements: "",
            skills_required: [],
            employment_type: "",
            salary_min: 0,
            salary_max: 0,
            location: "",
            is_remote: false,
            vacancies: 1
        }
    })

    useEffect(() => {
        const getJob = async () => {
            try {
                const fetchRes = await getJobById(id)
                if (fetchRes.success) {
                    setJobData(fetchRes.data)
                    form.reset({
                        title: fetchRes.data.title ?? "",
                        description: fetchRes.data.description ?? "",
                        requirements: fetchRes.data.requirements ?? "",
                        skills_required: fetchRes.data.skills_required ?? [],
                        employment_type: fetchRes.data.employment_type ?? "",
                        salary_min: Number(fetchRes.data.salary_min) || 0,
                        salary_max: Number(fetchRes.data.salary_max) || 0,
                        location: fetchRes.data.location ?? "",
                        is_remote: fetchRes.data.is_remote ?? false,
                        vacancies: fetchRes.data.vacancies ?? 1
                    })
                } else {
                    toast.error("Failed to fetch job. Please try again")
                }
            } finally {
                setIsLoading(false)
            }
        }
        getJob()
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

    const handleSubmit = async (values: FormValues) => {
        setIsSubmitting(true)
        console.log("Submitting: ", values)

        try {
            const updRes = await updateJob(
                id,
                values.title,
                values.description,
                values.requirements,
                values.skills_required,
                values.employment_type,
                values.salary_min,
                values.salary_max,
                values.location,
                values.is_remote,
                values.vacancies
            )

            if (updRes.success) {
                toast.success("Job has been updated successfully");
                form.reset({
                    title: values.title,
                    description: values.description,
                    requirements: values.requirements,
                    skills_required: values.skills_required,
                    employment_type: values.employment_type,
                    salary_min: values.salary_min,
                    salary_max: values.salary_max,
                    location: values.location,
                    is_remote: values.is_remote,
                    vacancies: values.vacancies
                })
            } else {
                toast.error("Failed to update job. Please try again")
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
                            <BreadcrumbLink href="/job-listings">Job Listings</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Edit Job — {jobData?.title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <form id="job-form" onSubmit={form.handleSubmit(handleSubmit)}>
                    <div className="flex flex-col gap-5">

                        {/* Basic Info */}
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-slate-200">
                                <CardTitle className="text-base font-semibold ">Basic Information</CardTitle>
                                <CardDescription>Provide the basic details about the job position.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-6 py-3">
                                <FieldGroup className="gap-5">
                                    <Controller name="title" control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <Label htmlFor="title">Job Title</Label>
                                                <Input {...field} id="title" placeholder="e.g. Senior Frontend Developer" aria-invalid={fieldState.invalid} />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    <Field className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Controller name="employment_type" control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <Label>Employment Type</Label>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select employment type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {employmentTypes.map(type => (
                                                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />

                                        <Controller name="location" control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <Label htmlFor="location">Location</Label>
                                                    <Input {...field} id="location" placeholder="e.g. Kuala Lumpur, Malaysia" aria-invalid={fieldState.invalid} />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                    </Field>

                                    <Controller name="is_remote" control={form.control}
                                        render={({ field }) => (
                                            <Field className="flex items-center gap-3" orientation="horizontal">
                                                <Label htmlFor="is_remote" className="cursor-pointer font-normal">Remote position</Label>
                                                <Switch
                                                    id="is_remote"
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </Field>
                                        )}
                                    />
                                </FieldGroup>
                            </CardContent>
                        </Card>

                        {/* Salary & Vacancies */}
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-slate-200">
                                <CardTitle className="text-base font-semibold ">Compensation & Vacancies</CardTitle>
                                <CardDescription>Set the salary range and number of open positions.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-6 py-3">
                                <FieldGroup className="gap-5">
                                    <Field className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <Controller name="salary_min" control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <Label htmlFor="salary_min">Min Salary (RM)</Label>
                                                    <Input
                                                        {...field}
                                                        id="salary_min"
                                                        type="number"
                                                        placeholder="e.g. 3000"
                                                        value={isNaN(field.value) || field.value === 0 ? "" : field.value}
                                                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                                        aria-invalid={fieldState.invalid}
                                                    />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />

                                        <Controller name="salary_max" control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <Label htmlFor="salary_max">Max Salary (RM)</Label>
                                                    <Input
                                                        {...field}
                                                        id="salary_max"
                                                        type="number"
                                                        placeholder="e.g. 6000"
                                                        value={isNaN(field.value) || field.value === 0 ? "" : field.value}
                                                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                                        aria-invalid={fieldState.invalid}
                                                    />
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
                                </FieldGroup>
                            </CardContent>
                        </Card>

                        {/* Skills */}
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-slate-200">
                                <CardTitle className="text-base font-semibold ">Skills Required</CardTitle>
                                <CardDescription>Add the skills candidates need for this position.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-6 py-3">
                                <Controller name="skills_required" control={form.control}
                                    render={({ fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <div className="flex gap-2 mb-3">
                                                <Input
                                                    value={skillInput}
                                                    onChange={(e) => setSkillInput(e.target.value)}
                                                    placeholder="e.g. React, TypeScript..."
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault()
                                                            handleAddSkill()
                                                        }
                                                    }}
                                                />
                                                <Button type="button" variant="outline" className="cursor-pointer shrink-0" onClick={handleAddSkill}>
                                                    <Plus size={14} /> Add
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {form.watch("skills_required").map((skill) => (
                                                    <Badge key={skill} variant="secondary" className="px-3 py-1.5 text-sm gap-1.5">
                                                        {skill}
                                                        <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-red-500 transition-colors cursor-pointer">
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

                        {/* Description & Requirements */}
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-slate-200">
                                <CardTitle className="text-base font-semibold ">Job Details</CardTitle>
                                <CardDescription>Describe the role and what you expect from candidates.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-6 py-3">
                                <FieldGroup className="gap-5">
                                    <Controller name="description" control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <Label htmlFor="description">Job Description</Label>
                                                <Textarea {...field} id="description" rows={5} placeholder="Describe the role, responsibilities and what the candidate will be doing..." aria-invalid={fieldState.invalid} />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    <Controller name="requirements" control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <Label htmlFor="requirements">Requirements</Label>
                                                <Textarea {...field} id="requirements" rows={4} placeholder="List qualifications, experience, and any other requirements..." aria-invalid={fieldState.invalid} />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                </FieldGroup>
                            </CardContent>
                        </Card>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-end gap-3">
                            <Button type="button" variant="outline" className="cursor-pointer px-5" onClick={() => router.push("/job-listings")}>
                                Cancel
                            </Button>
                            <Button type="submit" form="job-form" disabled={isSubmitting} className="cursor-pointer px-5">
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}