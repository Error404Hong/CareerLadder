"use client"

import { useUser } from "@clerk/nextjs"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Briefcase, MapPin, Users, Wallet, Upload, FileText, Check } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field"
import { toast } from "sonner"

import { Jobs } from "./JobCard"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"

import { getStudentProfile } from "@/app/api/user"
import { applyJob } from "@/app/api/job"

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_FILE_TYPE = ['application/pdf']

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    job: Jobs | null
}

const formSchema = z.object({
    resume: z.union([
        z.string(),
        z.any()
            .refine((file) => file?.length !== 0, "Resume must be uploaded")
            .refine((file) => file?.[0]?.size < MAX_FILE_SIZE, "Max 5MB")
            .refine((file) => ACCEPTED_FILE_TYPE.includes(file?.[0]?.type), "Only PDF allowed")
    ]),
    cover_letter: z.string(),
    skills: z.array(z.string()).min(1, "Please select at least one skill"),
    expected_salary: z.string().min(1, "Please enter your expected salary"),
    availability: z.string().min(1, "Please enter your soonest availability"),
})

type FormValues = z.infer<typeof formSchema>;

export function JobDrawer({ open, onOpenChange, job }: Props) {
    const { user } = useUser();
    const [openApplicationDialog, setOpenApplicationDialog] = useState<boolean>(false);
    const [resumeURL, setResumeURL] = useState<string>("");
    const [currentPhase, setCurrentPhase] = useState<number>(1);
    const [progressValue, setProgressValue] = useState<number>(25);
    const [skillsRequired, setSkillsRequired] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleApply = async () => {
        const userData = await getStudentProfile(user!.id)
        if (userData.success) {
            setResumeURL(userData.data.resume)
        } else {
            setResumeURL("")
        }

        if (!openApplicationDialog) {
            setOpenApplicationDialog(true)
            return
        }

        if (currentPhase === 1) {
            if (resumeURL && !form.watch("resume")?.[0]) {
                form.setValue("resume", resumeURL)
                setCurrentPhase(2)
                setProgressValue(50)
                setSkillsRequired(job?.skills_required ?? [])
                return
            }
            const isValid = await form.trigger("resume")
            if (!isValid) return
            setCurrentPhase(2)
            setProgressValue(50)
            setSkillsRequired(job?.skills_required ?? [])
        }

        if (currentPhase === 2) {
            const isValid = await form.trigger("skills")
            if (!isValid) return
            setCurrentPhase(3)
            setProgressValue(75)
        }

        if (currentPhase === 3) {
            const isValid = await form.trigger(["expected_salary", "availability"])
            if (!isValid) return

            const values = form.getValues()
            const formData = new FormData()

            if (typeof values.resume === "string") {
                formData.append("resume", values.resume)
            } else {
                formData.append("resume", values.resume[0])
            }

            formData.append("cover_letter", values.cover_letter)
            values.skills.forEach((skill) => formData.append("skills", skill))
            formData.append("expected_salary", values.expected_salary)
            formData.append("availability", values.availability)
            formData.append("clerkid", user!.id)
            formData.append("listingid", job!.id)

            try {
                setIsSubmitting(true)
                const application = await applyJob(formData);

                if (application.success) {
                    if (application.message === "You have already applied for this job earlier") {
                        toast.error("You have already applied for this job earlier")
                        setOpenApplicationDialog(false)
                        resetDialog();
                        return
                    }
                    setCurrentPhase(4);
                    setProgressValue(100);
                } else {
                    toast.error("Failed to apply for job. Please try again")
                    setOpenApplicationDialog(false)
                }

            } catch (error) {
                toast.error("Something went wrong. Please try again");
            } finally {
                setIsSubmitting(false)
            }
        }
    }

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            resume: resumeURL ?? "",
            cover_letter: "",
            skills: [],
            expected_salary: "",
            availability: ""
        }
    })

    const resetDialog = () => {
        setCurrentPhase(1);
        setProgressValue(25);
        form.reset();
    }

    return (
        <>
            <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="h-full min-w-[40%] ml-auto rounded-none flex flex-col">

                    {/* Header */}
                    <DrawerHeader className="border-b border-slate-100 px-6 py-5 space-y-0">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-col gap-4">
                                <Image
                                    src="/careerladder-logo.png"
                                    width={160}
                                    height={60}
                                    alt="Company Logo"
                                />
                                <div>
                                    <DrawerTitle className="text-xl font-bold text-[#0f172a] leading-snug">
                                        {job?.title}
                                    </DrawerTitle>
                                    <p className="text-sm text-[#2563eb] font-medium mt-0.5">{job?.company_id}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <Badge className="text-[11px] font-medium bg-green-100 text-green-700 border border-green-100 rounded-full px-3 py-1.5">
                                    {job?.status.toUpperCase()}
                                </Badge>
                                {job?.is_remote && (
                                    <Badge className="text-[11px] font-medium bg-blue-50 text-blue-500 border border-blue-100 rounded-full px-3 py-1.5">
                                        Remote
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">

                        {/* Details */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <Briefcase size={13} className="text-slate-400" />
                                <p className="text-sm font-medium text-[#0f172a] capitalize">{job?.employment_type}</p>

                            </div>
                            <div className="flex items-center gap-4">

                                <MapPin size={15} className="text-slate-400" />

                                <p className="text-sm font-medium text-[#0f172a]">{job?.location}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Wallet size={13} className="text-slate-400" />
                                <p className="text-sm font-medium text-[#0f172a]">
                                    RM {job?.salary_min.toLocaleString()} — RM {job?.salary_max.toLocaleString()} / month
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Users size={13} className="text-slate-400" />
                                <p className="text-sm font-medium text-[#0f172a]">
                                    {job?.vacancies} {job?.vacancies === 1 ? "spot" : "spots"} available
                                </p>
                            </div>
                        </div>

                        <div className="h-px bg-slate-300" />

                        {/* Skills */}
                        <div>
                            <p className="text-sm font-semibold text-[#0f172a] uppercase tracking-widest mb-3">Skills Required</p>
                            <div className="flex flex-wrap gap-2">
                                {job?.skills_required?.map((skill) => (
                                    <Badge key={skill} className="px-4 py-2 text-sm">{skill}</Badge>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-slate-300" />

                        {/* Requirements */}
                        {job?.requirements && (
                            <>
                                <div>
                                    <p className="text-sm font-semibold text-[#0f172a] uppercase tracking-widest mb-3">Requirements</p>
                                    <p className="text-sm text-slate-500 leading-relaxed">{job.requirements}</p>
                                </div>
                                <div className="h-px bg-slate-300" />
                            </>
                        )}

                        {/* Description */}
                        <div>
                            <p className="text-sm font-semibold text-[#0f172a] uppercase tracking-widest mb-3">About This Role</p>
                            <p className="text-sm text-slate-500 leading-relaxed">{job?.description}</p>
                        </div>

                    </div>

                    <DrawerFooter className="flex flex-row gap-3 border-t border-slate-300 px-6 py-4">
                        <DrawerClose asChild>
                            <Button size="sm" variant="outline" className="flex-1 cursor-pointer px-4 py-5">
                                Close
                            </Button>
                        </DrawerClose>
                        <Button size="sm" className="flex-1 cursor-pointer px-4 py-5" onClick={() => handleApply()}>
                            Apply Now
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            <Dialog open={openApplicationDialog} onOpenChange={(open) => {
                if (!open) resetDialog()
                setOpenApplicationDialog(open)
            }}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Apply for {job?.title}</DialogTitle>
                        <DialogDescription>Submit your application for this position.</DialogDescription>
                    </DialogHeader>

                    <Field>
                        <FieldLabel htmlFor="progress">
                            <span>Application progress</span>
                            <span className="ml-auto">{progressValue}%</span>
                        </FieldLabel>
                        <Progress value={progressValue} id="progress" />
                    </Field>

                    {currentPhase === 1 && (
                        <FieldGroup>
                            <Field>
                                <Label>Resume</Label>

                                {resumeURL ? (
                                    <>
                                        {/* Show current resume */}
                                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                                            <FileText size={14} className="text-slate-400 shrink-0" />
                                            <p className="text-sm text-slate-500 flex-1 truncate">
                                                {form.watch("resume")?.[0]?.name ?? resumeURL}
                                            </p>
                                            <span className="text-[11px] font-medium shrink-0 text-green-600">
                                                {form.watch("resume")?.[0] ? "Custom" : "Default"}
                                            </span>
                                        </div>

                                        {/* Option to replace */}
                                        <Controller name="resume" control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <label className="flex items-center gap-1.5 text-sm text-[#2563eb] cursor-pointer hover:underline mt-1">
                                                        <Upload size={11} />
                                                        {form.watch("resume")?.[0] ? "Change resume" : "Upload a different resume"}
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept=".pdf"
                                                            onChange={(e) => field.onChange(e.target.files)}
                                                        />
                                                    </label>
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                    </>
                                ) : (
                                    /* No resume — must upload */
                                    <Controller name="resume" control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <Input
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={(e) => field.onChange(e.target.files)}
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                )}
                            </Field>

                            <Field>
                                <Controller name="cover_letter" control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <Label htmlFor="cover_letter">Cover Letter <span className="text-slate-400">(optional)</span></Label>
                                            <Textarea {...field} id="cover_letter" aria-invalid={fieldState.invalid} placeholder="Tell the company why you're a great fit..." />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            </Field>
                        </FieldGroup>
                    )}

                    {currentPhase === 2 && (
                        <FieldGroup>
                            <Field>
                                <Label>Select the skills you can contribute to this project</Label>
                                <Controller
                                    name="skills"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <>
                                            {skillsRequired.map((skill) => (
                                                <div key={skill} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={skill}
                                                        checked={field.value.includes(skill)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                field.onChange([...field.value, skill])
                                                            } else {
                                                                field.onChange(field.value.filter((s: string) => s !== skill))
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor={skill}>{skill}</Label>
                                                </div>
                                            ))}
                                            {fieldState.invalid && (
                                                <p className="text-sm text-red-500">{fieldState.error?.message}</p>
                                            )}
                                        </>
                                    )}
                                />
                            </Field>
                        </FieldGroup>
                    )}

                    {currentPhase === 3 && (
                        <FieldGroup>
                            <Field>
                                <Controller name="expected_salary" control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <Label htmlFor="expected_salary">Expected Salary <span className="text-slate-400">(RM / month)</span></Label>
                                            <Input
                                                {...field}
                                                id="expected_salary"
                                                type="text"
                                                inputMode="numeric"
                                                placeholder={`e.g. ${job?.salary_min.toLocaleString()}`}
                                            />
                                            {job?.salary_min && job?.salary_max && (
                                                <FieldDescription className="text-xs text-slate-400 mt-1">
                                                    Budget range: RM {job.salary_min.toLocaleString()} — RM {job.salary_max.toLocaleString()} / month
                                                </FieldDescription>
                                            )}
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            </Field>

                            <Field>
                                <Controller name="availability" control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <Label htmlFor="availability">Availability</Label>
                                            <Input
                                                {...field}
                                                id="availability"
                                                placeholder="Please provide your soonest availability. Eg. 1 month.."
                                            />
                                            <FieldDescription className="text-xs text-slate-400 mt-1">When are you available to start?</FieldDescription>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            </Field>
                        </FieldGroup>
                    )}

                    {currentPhase === 4 && (
                        <div className="flex flex-col items-center justify-center py-8 gap-4">
                            <div className="w-16 h-16 rounded-full bg-green-100 border border-green-100 flex items-center justify-center">
                                <Check size={28} className="text-green-600" />
                            </div>
                            <div className="text-center">
                                <p className="text-base font-semibold text-[#0f172a]">Application Submitted!</p>
                                <p className="text-sm text-slate-400 mt-1">You can track your application status in the Applications page.</p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        {currentPhase !== 4 && (
                            <DialogClose asChild>
                                <Button variant="outline" size="sm" className="cursor-pointer px-4 py-5" onClick={resetDialog}>
                                    Cancel
                                </Button>
                            </DialogClose>
                        )}
                        <Button
                            size="sm"
                            className="cursor-pointer px-4 py-5"
                            disabled={isSubmitting}
                            onClick={currentPhase === 4 ? () => { setOpenApplicationDialog(false); resetDialog() } : handleApply}
                        >
                            {currentPhase === 1 ? "Next"
                                : currentPhase === 2 ? "Next"
                                    : currentPhase === 3 ? (isSubmitting ? "Submitting..." : "Submit Application")
                                        : "Close"}
                        </Button>
                    </DialogFooter>
                </DialogContent>

            </Dialog>
        </>
    )
}