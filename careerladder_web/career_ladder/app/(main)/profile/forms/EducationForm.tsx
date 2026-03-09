"use client"

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { YearPicker } from "@/components/ui/yearpicker"

export const educationFormSchema = z.object({
    institution: z.string().min(1, "Institution name is too short"),
    field: z.string().min(5, "Field is too short"),
    start_year: z.string().min(4, "Start year is required"),
    end_year: z.string(),
    is_current: z.boolean(),
})

export type EducationFormValues = z.infer<typeof educationFormSchema>;

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    form: ReturnType<typeof useForm<EducationFormValues>>
    onSubmit: (values: EducationFormValues) => Promise<void>
}

export default function EducationForm({ open, onOpenChange, form, onSubmit }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <form id="education-form" onSubmit={form.handleSubmit(onSubmit)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add Education</DialogTitle>
                        <DialogDescription>Provide details about your education to showcase your academic background.</DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="gap-5">
                        <Field>
                            <Controller name="institution" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="institution">Institution</Label>
                                        <Input {...field} id="institution" aria-invalid={fieldState.invalid} placeholder="Exp: Asia Pacific University" />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </Field>

                        <Field>
                            <Controller name="field" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="field">Field</Label>
                                        <Input {...field} id="field" aria-invalid={fieldState.invalid} placeholder="Exp: Diploma in Software Engineer..." />
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
                                            I am currently studying here
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
                        <Button type="submit" form="education-form" className="cursor-pointer bg-(--color-navy-mid)">
                            Add Education
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>

        </Dialog>
    )
}