"use client"

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectLabel } from "@/components/ui/select"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"

export const languageFormSchema = z.object({
    language: z.string().min(1, "Language cannot be empty"),
    proficiency: z.string().min(1, "Proficiency level is required"),
})

export type LanguageFormValues = z.infer<typeof languageFormSchema>;

export const proficiencyLevels = [
    { value: "beginner", label: "Beginner", pct: 20 },
    { value: "elementary", label: "Elementary", pct: 40 },
    { value: "intermediate", label: "Intermediate", pct: 60 },
    { value: "advanced", label: "Advanced", pct: 80 },
    { value: "fluent", label: "Fluent", pct: 90 },
    { value: "native", label: "Native", pct: 100 },
] as const

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    form: ReturnType<typeof useForm<LanguageFormValues>>
    onSubmit: (values: LanguageFormValues) => Promise<void>
}

export default function LanguageForm({ open, onOpenChange, form, onSubmit }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <form id="language-form" onSubmit={form.handleSubmit(onSubmit)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add Language</DialogTitle>
                        <DialogDescription>List the languages you can communicate in and indicate your proficiency level.</DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="gap-5">
                        <Field>
                            <Controller name="language" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="language">Language</Label>
                                        <Input {...field} id="language" aria-invalid={fieldState.invalid} placeholder="Exp: Mandarin, English, Cantonese..." />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </Field>

                        <Field>
                            <Field>
                                <Label>Proficiency</Label>
                                <Controller name="proficiency" control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Proficiency Level" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Proficiency Level</SelectLabel>
                                                    {proficiencyLevels.map((item) => (
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
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" className="cursor-pointer">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" form="language-form" className="cursor-pointer bg-(--color-navy-mid)">
                            Add Language
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}