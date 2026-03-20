"use client"

import { useUser } from "@clerk/nextjs"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldError, FieldDescription } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectLabel } from "@/components/ui/select"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateCompanyProfile } from "@/app/api/user"
import { toast } from "sonner"
import type { CompanyProfile } from "../page"
import { useEffect } from "react"


type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    profile: CompanyProfile | null
    onSuccess: (updatedProfile: CompanyProfile) => void
}

const industries = [
    "Information Technology",
    "Software as a Service",
    "Data Analytics",
    "Cloud Computing",
    "Design & Creative",
    "Finance & Banking",
    "Healthcare",
    "Education",
    "E-Commerce",
    "Manufacturing",
    "Consulting",
    "Media & Entertainment",
    "Telecommunications",
    "Construction",
    "Other",
]

const formSchema = z.object({
    company_name: z.string().min(1, "Company name is required"),
    industry: z.string().min(1, "Industry is required"),
    company_size: z.string().min(1, "Company size is required"),
    founded_year: z.number().min(1900).max(new Date().getFullYear()),
    website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    location: z.string().min(1, "Location is required"),
})

type FormValues = z.infer<typeof formSchema>;

export function ProfileForm({ open, onOpenChange, profile, onSuccess }: Props) {
    const { user } = useUser();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            company_name: profile?.company_name ?? "",
            industry: profile?.industry ?? "",
            company_size: profile?.company_size ?? "",
            founded_year: profile?.founded_year ?? 2000,
            website: profile?.website ?? "",
            location: profile?.location ?? "",
        }
    })

    useEffect(() => {
        if (!open) {
            form.reset({
                company_name: profile?.company_name ?? "",
                industry: profile?.industry ?? "",
                company_size: profile?.company_size ?? "",
                founded_year: profile?.founded_year ?? 2000,
                website: profile?.website ?? "",
                location: profile?.location ?? "",
            })
        }
    }, [open])


    const handleSubmit = async (values: FormValues) => {

        const updRes = await updateCompanyProfile(
            values.company_name,
            values.industry,
            values.company_size,
            values.founded_year,
            values.website ?? "",
            values.location,
            user!.id
        )

        if (updRes.success) {
            toast.success("Company profile has been updated successfully");
            onSuccess(updRes.data);
            onOpenChange(false);
        } else {
            toast.error("Failed to update company profile. Please try again");
            onOpenChange(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <form id="profile-form" onSubmit={form.handleSubmit(handleSubmit)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Company Profile</DialogTitle>
                        <DialogDescription>Update your company information to keep your profile accurate and up to date.</DialogDescription>
                    </DialogHeader>

                    <FieldGroup>
                        <Field>
                            <Controller name="company_name" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="company_name">Company Name</Label>
                                        <Input {...field} id="company_name" aria-invalid={fieldState.invalid} placeholder="Exp: ABC Sdn Bhd" />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </Field>

                        <Field className="grid grid-cols-1 sm:grid-cols-2">
                            <Controller name="company_size" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="company_size">Company Size</Label>
                                        <Input {...field} id="company_size" aria-invalid={fieldState.invalid} placeholder="Exp: 1-20" />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Field>
                                <Label>Industry</Label>
                                <Controller name="industry" control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Company Industry" />
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Job Types</SelectLabel>
                                                        {industries.map((item) => (
                                                            <SelectItem key={item} value={item}>
                                                                {item}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </SelectTrigger>
                                        </Select>
                                    )}
                                />
                            </Field>
                        </Field>

                        <Field className="grid grid-cols-1 sm:grid-cols-2">
                            <Controller name="location" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="location">Company Location</Label>
                                        <Input {...field} id="location" aria-invalid={fieldState.invalid} placeholder="Exp: Kuala Lumpur, Malaysia" />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller name="founded_year" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="founded_year">Founded Year</Label>
                                        <Input
                                            {...field}
                                            id="founded_year"
                                            type="number"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Exp: 2000"
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </Field>

                        <Field>
                            <Controller name="website" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="website">Company Website (Optional)</Label>
                                        <Input {...field} id="website" aria-invalid={fieldState.invalid} placeholder="Exp: www.abc.com.my" />
                                        <FieldDescription>Make sure your website URL starts with http:// or https:// (e.g. https://example.com)</FieldDescription>
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
                        <Button type="submit" form="profile-form" className="cursor-pointer bg-(--color-navy-mid)">
                            Update Profile
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}