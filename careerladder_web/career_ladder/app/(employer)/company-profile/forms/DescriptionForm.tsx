"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect } from "react"

import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogHeader } from "@/components/ui/dialog"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"

import { updateCompanyDesciption } from "@/app/api/user"
import type { CompanyProfile } from "../page"


type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    profile: CompanyProfile | null
    onSuccess: (updatedProfile: CompanyProfile) => void
}

const formSchema = z.object({
    description: z.string().min(10, "Company description is too short")
})

type FormValue = z.infer<typeof formSchema>;

export function DescriptionForm({ open, onOpenChange, profile, onSuccess }: Props) {
    const { user } = useUser();

    const form = useForm<FormValue>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: profile?.description ?? ""
        }
    })

    useEffect(() => {
        if (!open) {
            form.reset({
                description: profile?.description ?? ""
            })
        }
    }, [open])

    const handleSubmit = async (values: FormValue) => {
        console.log("Submitting: ", values);

        const updRes = await updateCompanyDesciption(values.description, user!.id);

        if (updRes.success) {
            toast.success("Company description updated successfully");
            onOpenChange(false);
            onSuccess(updRes.data);
        } else {
            toast.error("Failed to update company description")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <form id="description-form" onSubmit={form.handleSubmit(handleSubmit)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Company Description</DialogTitle>
                        <DialogDescription>Update your company description to reflect your latest business activities and key strengths.</DialogDescription>
                    </DialogHeader>

                    <FieldGroup>
                        <Field>
                            <Controller name="description" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="description">Company Description</Label>
                                        <Textarea {...field} id="description" aria-invalid={fieldState.invalid} placeholder="Please Tell us about your company, what you do, and your key strengths" />
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
                        <Button type="submit" form="description-form" className="cursor-pointer bg-(--color-navy-mid)">
                            Update Company Description
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}