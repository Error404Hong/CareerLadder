"use client"

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { Input } from "@/components/ui/input"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    form: ReturnType<typeof useForm<SkillsFormValues>>
    onSubmit: (values: SkillsFormValues) => Promise<void>
}

export const skillsFormSchema = z.object({
    name: z.string().min(1, "Skills cannot be empty")
})

export type SkillsFormValues = z.infer<typeof skillsFormSchema>;

export default function SkillForm({ open, onOpenChange, form, onSubmit }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <form id="skill-form" onSubmit={form.handleSubmit(onSubmit)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add Skills</DialogTitle>
                        <DialogDescription>Showcase the technical and professional skills that highlight your expertise and strengths.</DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="gap-5">
                        <Field>
                            <Controller name="name" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="name">Skill</Label>
                                        <Input {...field} id="name" aria-invalid={fieldState.invalid} />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </Field>
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" className="cursor-pointer">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" form="skill-form" className="cursor-pointer bg-(--color-navy-mid)">
                            Add Skill
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}