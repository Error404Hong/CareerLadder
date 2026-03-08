"use client"

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectLabel } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"

export const formSchema = z.object({
    fname: z.string().min(5, "First name is too short"),
    lname: z.string().min(1, "Last name is too short"),
    email: z.string().min(10, "Email is too short"),
    major: z.string().min(5, "Major is too short"),
    jobtype: z.string().min(1, "Job type cannot be empty"),
    linkedin_url: z.string().min(1, "LinkedIn URL cannot be empty"),
    work_status: z.boolean(),
    location: z.string().min(1, "Location is too short")
})

export type ProfileFormValues = z.infer<typeof formSchema>

export const jobTypes = [
    { value: "0", label: "Just Exploring" },
    { value: "1", label: "Freelance" },
    { value: "2", label: "Part Time" },
    { value: "3", label: "Full Time" },
    { value: "4", label: "Internship" }
] as const

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    form: ReturnType<typeof useForm<ProfileFormValues>>
    onSubmit: (values: ProfileFormValues) => Promise<void>
}

export default function ProfileForm({ open, onOpenChange, form, onSubmit }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange} >
            <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>Update your profile information</DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="gap-5">
                        <Field className="grid grid-cols-1 sm:grid-cols-2">
                            <Controller name="fname" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="fname">First Name</Label>
                                        <Input {...field} id="fname" aria-invalid={fieldState.invalid} />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller name="lname" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="lname">Last Name</Label>
                                        <Input {...field} id="lname" aria-invalid={fieldState.invalid} />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </Field>

                        <Field className="grid grid-cols-1 sm:grid-cols-2">
                            <Controller name="email" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="email">Email</Label>
                                        <Input {...field} id="email" aria-invalid={fieldState.invalid} />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller name="location" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="location">Location</Label>
                                        <Input {...field} id="location" aria-invalid={fieldState.invalid} />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </Field>

                        <Field>
                            <Controller name="major" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="major">Major</Label>
                                        <Input {...field} id="major" aria-invalid={fieldState.invalid} />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </Field>

                        <Field className="grid grid-cols-1 sm:grid-cols-2">
                            <Field>
                                <Label>Preferred Job Type</Label>
                                <Controller name="jobtype" control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a Preferred Job Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Job Types</SelectLabel>
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

                            <Field>
                                <Controller name="linkedin_url" control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                                            <Input {...field} id="linkedin_url" aria-invalid={fieldState.invalid} />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            </Field>
                        </Field>

                        <Field>
                            <Controller name="work_status" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} orientation="horizontal" className="max-w-sm">
                                        <Label htmlFor="work_status" className="cursor-pointer">Open to Work?</Label>
                                        <Switch
                                            id="work_status" aria-invalid={fieldState.invalid} checked={field.value} onCheckedChange={field.onChange}
                                        />

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
                        <Button type="submit" form="profile-form" className="cursor-pointer bg-(--color-navy-mid)">
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
