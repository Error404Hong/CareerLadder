"use client"

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    form: ReturnType<typeof useForm<SummaryFormValues>>
    onSubmit: (values: SummaryFormValues) => Promise<void>
}

export const summaryFormSchema = z.object({
    summary: z.string().min(10, "Profile summary is too short. Please include more details.")
})

export type SummaryFormValues = z.infer<typeof summaryFormSchema>;


export default function SummaryForm({ open, onOpenChange, form, onSubmit }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <form id="summary-form" onSubmit={form.handleSubmit(onSubmit)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Profile Summary</DialogTitle>
                        <DialogDescription>Highlight your unique experiences, ambitions and strengths.</DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="gap-5">
                        <Field>
                            <Controller name="summary" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="summary">Summary</Label>
                                        <Textarea {...field} id="summary" aria-invalid={fieldState.invalid} />
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
                        <Button type="submit" form="summary-form" className="cursor-pointer bg-(--color-navy-mid)">
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}