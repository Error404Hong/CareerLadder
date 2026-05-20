"use client"

import { useUser } from "@clerk/nextjs"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Upload, FileText, Check } from "lucide-react"
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
import { createNotification } from "@/app/api/notifications"
import Link from "next/link"

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_FILE_TYPE = ['application/pdf']

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    job: Jobs | null
}

const formSchema = z.object({
    resume: z.union([
        z.string().min(1, "Resume must be uploaded"),
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

                    await Promise.all([
                        createNotification(
                            user!.id,
                            "job_applied",
                            "Job Application Submitted",
                            `You have successfully applied for ${job?.title} at ${job?.company_name}`,
                            "job",
                            job!.id
                        ),
                        createNotification(
                            job!.company_id,
                            "application_received",
                            "New Job Application",
                            `A student has applied for a job opening: ${job?.title}`,
                            "job",
                            job!.id
                        )
                    ])

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
                <DrawerContent className="h-full min-w-110 ml-auto rounded-none flex flex-col border-0 border-l border-slate-200 bg-white">

                    {/* ── Header ── */}
                    <DrawerHeader className="p-0 border-0 shrink-0">
                        <div className="px-7 pt-7 pb-6 border-b border-slate-100">

                            {/* Logo row */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="h-10 flex items-center">
                                    {job?.company_logo_url
                                        ? <Image src={job.company_logo_url} width={100} height={32} alt="Company Logo" className="object-contain object-left w-15" />
                                        : <span className="text-[11px] font-semibold tracking-[0.15em] text-slate-300 uppercase">No Logo</span>
                                    }
                                </div>
                                <div className="flex items-center gap-2 pt-0.5">
                                    <span className="text-[10px] font-semibold tracking-[0.14em] uppercase px-2.5 py-1 rounded-sm border border-slate-200 text-slate-500 bg-white">
                                        {job?.status}
                                    </span>
                                    {job?.is_remote && (
                                        <span className="text-[10px] font-semibold tracking-[0.14em] uppercase px-2.5 py-1 rounded-sm border border-slate-200 text-slate-500 bg-white">
                                            Remote
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Title + company */}
                            <DrawerTitle className="text-[22px] font-bold text-slate-900 leading-tight tracking-tight mb-1">
                                {job?.title}
                            </DrawerTitle>
                            <Link href={`/companies/${job?.company_id}`}>
                                <p className="text-[13px] text-slate-400 hover:text-slate-600 transition-colors">
                                    {job?.company_name}
                                </p>
                            </Link>
                        </div>

                        {/* ── Stats bar ── */}
                        <div className="grid grid-cols-2 border-b border-slate-100">
                            <div className="px-7 py-4 border-r border-slate-100">
                                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-1">Employment</p>
                                <p className="text-[13px] font-medium text-slate-800 capitalize">{job?.employment_type ?? "—"}</p>
                            </div>
                            <div className="px-7 py-4">
                                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-1">Location</p>
                                <p className="text-[13px] font-medium text-slate-800 truncate">{job?.location ?? "—"}</p>
                            </div>
                            <div className="px-7 py-4 border-t border-r border-slate-100">
                                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-1">Salary</p>
                                <p className="text-[13px] font-medium text-slate-800">
                                    RM {job?.salary_min.toLocaleString()} – {job?.salary_max.toLocaleString()}
                                    <span className="text-slate-400 font-normal"> /mo</span>
                                </p>
                            </div>
                            <div className="px-7 py-4 border-t border-slate-100">
                                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-1">Openings</p>
                                <p className="text-[13px] font-medium text-slate-800">{job?.vacancies} {job?.vacancies === 1 ? "position" : "positions"}</p>
                            </div>
                        </div>
                    </DrawerHeader>

                    {/* ── Body ── */}
                    <div className="flex-1 overflow-y-auto">

                        {job?.skills_required && job.skills_required.length > 0 && (
                            <div className="px-7 py-5 border-b border-slate-100">
                                <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-400 mb-3">Skills Required</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {job.skills_required.map(skill => (
                                        <span key={skill} className="text-[12px] font-medium text-slate-600 px-3 py-1 rounded-sm border border-slate-200 bg-slate-50">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {job?.requirements && (
                            <div className="px-7 py-5 border-b border-slate-100">
                                <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-400 mb-3">Requirements</p>
                                <p className="text-[13px] text-slate-500 leading-[1.75]">{job.requirements}</p>
                            </div>
                        )}

                        {job?.description && (
                            <div className="px-7 py-5">
                                <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-400 mb-3">About This Role</p>
                                <p className="text-[13px] text-slate-500 leading-[1.75]">{job.description}</p>
                            </div>
                        )}

                    </div>

                    {/* ── Footer ── */}
                    <DrawerFooter className="bg-white border-t border-slate-100 px-7 py-4 flex flex-row gap-2">
                        <DrawerClose asChild>
                            <Button size="sm" variant="outline" className="flex-1 h-10 rounded-sm text-[13px] font-medium text-slate-500 border-slate-200 hover:bg-slate-50 cursor-pointer">
                                Close
                            </Button>
                        </DrawerClose>
                        <Button size="sm" className="flex-1 h-10 rounded-sm text-[13px] font-semibold cursor-pointer bg-slate-900 hover:bg-slate-800 text-white" onClick={() => handleApply()}>
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
                                        <div className="flex items-center gap-3 bg-slate-100 border border-slate-200 rounded-xl p-3">
                                            <FileText size={14} className="text-slate-400 shrink-0" />
                                            <p className="text-sm text-slate-500 flex-1 truncate">
                                                {form.watch("resume")?.[0]?.name ?? resumeURL}
                                            </p>
                                            <span className="text-[11px]  shrink-0 text-green-600">
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