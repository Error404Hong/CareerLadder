"use client"

import { Info } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectLabel } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"

export const experienceFormSchema = z.object({
    jobtitle: z.string().min(1, "Job title cannot be empty"),
    jobdescription: z.string().min(10, "Job description is too short"),
    company: z.string().min(1, "Company name cannot be empty"),
    start_year: z.string().min(4, "Start year is required"),
    end_year: z.string().nullish(),
    is_current: z.boolean(),
    location: z.string().nullish(),
    employment_type: z.string().min(1, "Employement type is required")
})

export type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

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
                </DialogContent>
            </form>
        </Dialog>
    )
}