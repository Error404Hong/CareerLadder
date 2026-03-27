"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { toast } from "sonner"
import { CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import { cn } from "@/lib/utils"

import { createNewTrainingProgram } from "@/app/api/training"
import { userAgent } from "next/server"

const formSchema = z.object({
    title: z.string().min(1, "Training program title is required"),
    description: z.string().min(20, "Please provide a detailed program description"),
    prerequisites: z.string().min(10, "Please specify the required prerequisites for participants"),
    expected_outcome: z.string().min(10, "Please describe the expected outcomes of the program"),
    location: z.string().min(1, "Training location is required"),
    date: z.date({ message: "Date for training program is required" }),
    time: z.iso.time({ message: "Time for training program is required" }),
    duration: z.string().min(1, "Duration cannot be empty"),
    vacancies: z.number().min(1, "Program vacancies must be more than one"),
    is_public: z.boolean(),
    application_deadline: z.date({ message: "Registration deadline is required" })
}).refine(data => !data.date || !data.application_deadline || data.application_deadline <= data.date, {
    message: "Registration deadline cannot be later than the training date",
    path: ["application_deadline"]
})

type FormValues = z.infer<typeof formSchema>

export default function CreateTraining() {
    const router = useRouter()
    const { user } = useUser()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            prerequisites: "",
            expected_outcome: "",
            location: "",
            time: "",
            duration: "",
            vacancies: 1,
            is_public: false,
        }
    })

    const handleSubmit = async (values: FormValues) => {
        try {
            const insertRes = await createNewTrainingProgram(
                user!.id,
                values.title,
                values.description,
                values.prerequisites,
                values.expected_outcome,
                values.location,
                format(values.date, "yyyy-MM-dd"),
                values.time,
                values.duration,
                values.vacancies,
                values.is_public,
                format(values.application_deadline, "yyyy-MM-dd")
            )

            if (insertRes.success) {
                toast.success("Training Program has been created successfully");
            } else {
                toast.error("Failed to create new training program")
            }
        } finally {
            form.reset();
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
                            <BreadcrumbLink href="/training-programs">Training Programs</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Create New Training Program</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <form id="training-form" onSubmit={form.handleSubmit(handleSubmit)}>
                    <div className="flex flex-col gap-5">

                        {/* Basic Information */}
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-grey-300">
                                <CardTitle className="text-base font-semibold">Basic Information</CardTitle>
                                <CardDescription>Provide the basic details about the training program.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-6 py-3">
                                <FieldGroup className="gap-5">

                                    {/* Title */}
                                    <Controller name="title" control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <Label htmlFor="title">Program Title</Label>
                                                <Input {...field} id="title" placeholder="e.g. REST API Development with Node.js" aria-invalid={fieldState.invalid} />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    {/* Location */}
                                    <Controller name="location" control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <Label htmlFor="location">Location</Label>
                                                <Input {...field} id="location" placeholder="e.g. Online, Kuala Lumpur" aria-invalid={fieldState.invalid} />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    {/* Public */}
                                    <Controller name="is_public" control={form.control}
                                        render={({ field }) => (
                                            <Field className="flex items-center gap-3" orientation="horizontal">
                                                <Label htmlFor="is_public" className="cursor-pointer font-normal">Make this program publicly visible</Label>
                                                <Switch
                                                    id="is_public"
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </Field>
                                        )}
                                    />

                                </FieldGroup>
                            </CardContent>
                        </Card>

                        {/* Schedule & Capacity */}
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-grey-300">
                                <CardTitle className="text-base font-semibold">Schedule & Capacity</CardTitle>
                                <CardDescription>Set the date, time, duration, and number of available spots.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-6 py-3">
                                <FieldGroup className="gap-5">

                                    {/* Date + Time + Duration */}
                                    <Field className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                                        {/* Training Date */}
                                        <Controller name="date" control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <Label>Training Date</Label>
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
                                                                onSelect={field.onChange}
                                                                disabled={(date) => date < new Date()}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />

                                        {/* Start Time */}
                                        <Controller name="time" control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <Label htmlFor="time">Start Time</Label>
                                                    <Input {...field} id="time" type="time" aria-invalid={fieldState.invalid} />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />

                                        {/* Duration */}
                                        <Controller name="duration" control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <Label htmlFor="duration">Duration</Label>
                                                    <Input {...field} id="duration" placeholder="e.g. 1 day, 3 hours" aria-invalid={fieldState.invalid} />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />

                                    </Field>

                                    {/* Vacancies + Registration Deadline */}
                                    <Field className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        {/* Vacancies */}
                                        <Controller name="vacancies" control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <Label htmlFor="vacancies">Vacancies</Label>
                                                    <Input
                                                        {...field}
                                                        id="vacancies"
                                                        type="number"
                                                        placeholder="e.g. 30"
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                        aria-invalid={fieldState.invalid}
                                                    />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />

                                        {/* Registration Deadline */}
                                        <Controller name="application_deadline" control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <Label>Registration Deadline</Label>
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
                                                                onSelect={field.onChange}
                                                                disabled={(date) => {
                                                                    const trainingDate = form.watch("date")
                                                                    return date < new Date() || (!!trainingDate && date > trainingDate)
                                                                }}
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

                        {/* Program Details */}
                        <Card className="rounded-lg border border-slate-200 shadow-sm">
                            <CardHeader className="px-5 border-b border-grey-300">
                                <CardTitle className="text-base font-semibold">Program Details</CardTitle>
                                <CardDescription>Describe the program, what participants need to know beforehand, and what they will gain.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-6 py-3">
                                <FieldGroup className="gap-5">

                                    <Controller name="description" control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <Label htmlFor="description">Program Description</Label>
                                                <Textarea
                                                    {...field}
                                                    id="description"
                                                    rows={5}
                                                    placeholder="Describe what this training program covers and what participants will be doing..."
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    <Controller name="prerequisites" control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <Label htmlFor="prerequisites">Prerequisites</Label>
                                                <Textarea
                                                    {...field}
                                                    id="prerequisites"
                                                    rows={3}
                                                    placeholder="List any prior knowledge or skills participants must have before joining..."
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    <Controller name="expected_outcome" control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <Label htmlFor="expected_outcome">Expected Outcome</Label>
                                                <Textarea
                                                    {...field}
                                                    id="expected_outcome"
                                                    rows={3}
                                                    placeholder="Describe what participants will be able to do or achieve after completing this program..."
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
                                onClick={() => router.push("/training-programs")}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                form="training-form"
                                className="cursor-pointer p-5"
                            >
                                Create Training
                            </Button>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    )
}
