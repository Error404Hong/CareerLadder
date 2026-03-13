"use client"

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { YearPicker } from "@/components/ui/yearpicker"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectLabel } from "@/components/ui/select"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"

export const experienceFormSchema = z.object({
    jobtitle: z.string().min(1, "Job title cannot be empty"),
    jobdescription: z.string().min(10, "Job description is too short"),
    company: z.string().min(1, "Company name cannot be empty"),
    start_year: z.string().min(4, "Start year is required"),
    end_year: z.string(),
    is_current: z.boolean(),
    location: z.string().min(1, "Location cannot be empty"),
    employment_type: z.string().min(1, "Employement type is required")
})

export type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

export const jobTypes = [
    { value: "1", label: "Freelance" },
    { value: "2", label: "Part Time" },
    { value: "3", label: "Full Time" },
    { value: "4", label: "Internship" }
] as const

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    form: ReturnType<typeof useForm<ExperienceFormValues>>
    onSubmit: (values: ExperienceFormValues) => Promise<void>
    mode?: "add" | "edit"
}

export default function ExperienceForm({ open, onOpenChange, form, onSubmit, mode = "add" }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <form id="experience-form" onSubmit={form.handleSubmit(onSubmit)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {mode === "edit"
                                ? "Edit Work Experience"
                                : "Add New Work Experience"
                            }
                        </DialogTitle>
                        <DialogDescription>
                            {mode === "edit"
                                ? "Update your work experience details."
                                : "Provide details about your work experience to showcase your academic background."
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="gap-5">
                        <Field>
                            <Controller name="jobtitle" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="jobtitle">Job Title / Position</Label>
                                        <Input {...field} id="jobtitle" aria-invalid={fieldState.invalid} placeholder="Exp: Full Stack Developer..." />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </Field>

                        <Field>
                            <Controller name="jobdescription" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="jobdescription">Job Description</Label>
                                        <Textarea {...field} id="jobdescription" aria-invalid={fieldState.invalid} placeholder="Describe your responsibilities, achievements, and key tasks in this role..." />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </Field>

                        <Field>
                            <Field>
                                <Label>Employment Type</Label>
                                <Controller name="employment_type" control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Employment Type" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Employment Types</SelectLabel>
                                                    {jobTypes.map((item) => (
                                                        <SelectItem key={item.value} value={item.value}>
                                                            {item.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}

                                        </Select>
                                    )}
                                />
                            </Field>
                        </Field>

                        <Field className="grid grid-cols-1 sm:grid-cols-2">
                            <Controller name="company" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="company">Company</Label>
                                        <Input {...field} id="company" aria-invalid={fieldState.invalid} placeholder="Exp: Google, Microsoft, or ABC Sdn Bhd" />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller name="location" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="location">Location</Label>
                                        <Input {...field} id="location" aria-invalid={fieldState.invalid} placeholder="Exp: Kuala Lumpur, Malaysia" />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </Field>

                        <Field className="grid grid-cols-1 sm:grid-cols-2">
                            <Controller name="start_year" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="start_date">Start Year</Label>
                                        <YearPicker value={field.value} onChange={field.onChange} placeholder="Start year" />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller name="end_year" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="end_date">End Year (optional)</Label>
                                        <YearPicker value={field.value} onChange={field.onChange} placeholder="End year" />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </Field>

                        <Field>
                            <Controller name="is_current" control={form.control}
                                render={({ field }) => (
                                    <Field className="flex items-center gap-3" orientation="horizontal">
                                        <Checkbox
                                            id="is_current"
                                            checked={field.value}
                                            onCheckedChange={(checked) => {
                                                field.onChange(checked)
                                                if (checked) form.setValue("end_year", "")
                                            }}
                                        />
                                        <Label htmlFor="is_current" className="cursor-pointer font-normal">
                                            I am currently working here
                                        </Label>
                                    </Field>
                                )}
                            />
                        </Field>
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" className="cursor-pointer">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" form="experience-form" className="cursor-pointer bg-(--color-navy-mid)">
                            {mode === "edit"
                                ? "Update Work Experience"
                                : "Add Work Experience"
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}