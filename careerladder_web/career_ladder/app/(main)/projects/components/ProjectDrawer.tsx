"use client"

import { useUser } from "@clerk/nextjs"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Calendar, Clock, Users, Wallet, Upload, FileText, Check } from "lucide-react"
import type { Project } from "./ProjectCard"
import { Progress } from "@/components/ui/progress"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

import { getStudentProfile } from "@/app/api/user"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { applyProjects } from "@/app/api/project"

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_FILE_TYPE = ['application/pdf']

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    project: Project | null
}

const formSchema = z.object({
    resume: z.union([
        z.string(), // for existing resume (URL)
        z
            .any()
            .refine((file) => file?.length !== 0, "Resume must be uploaded")
            .refine((file) => file?.[0]?.size < MAX_FILE_SIZE, "Max 5MB")
            .refine((file) => ACCEPTED_FILE_TYPE.includes(file?.[0]?.type), "Only PDF allowed")
    ]),
    cover_letter: z.string(),
    skills: z.array(z.string()).min(1, "Please select at least one skill")
});

type FormValues = z.infer<typeof formSchema>;


export function ProjectDrawer({ open, onOpenChange, project }: Props) {
    const { user } = useUser();
    const [applyDialogOpen, setApplyDialogOpen] = useState<boolean>(false);
    const [resumeURL, setResumeURL] = useState<string>("");
    const [currentPhase, setCurrentPhase] = useState<number>(1);
    const [progressValue, setProgressValue] = useState<number>(33);
    const [skillsRequired, setSkillsRequired] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleApply = async () => {

        const userData = await getStudentProfile(user!.id);

        if (userData.success) {
            setResumeURL(userData.data.resume);
        } else {
            setResumeURL("");
        }

        if (!applyDialogOpen) {
            setApplyDialogOpen(true);
            return;
        }

        if (currentPhase === 1) {
            if (resumeURL && !form.watch("resume")?.[0]) {
                form.setValue("resume", resumeURL) // set string value
                setCurrentPhase(2)
                setProgressValue(66)
                setSkillsRequired(project?.skills_required ?? [])
                return
            }

            const isValid = await form.trigger("resume");
            if (!isValid) return;

            setCurrentPhase(2);
            setProgressValue(66);
            setSkillsRequired(project?.skills_required ?? []);
        }

        if (currentPhase === 2) {
            const isValid = await form.trigger("skills")
            if (!isValid) return

            const values = form.getValues();
            const formData = new FormData();

            if (typeof values.resume === "string") {
                formData.append("resume", values.resume)
            } else {
                formData.append("resume", values.resume[0])
            }

            formData.append("cover_letter", values.cover_letter);
            formData.append("skills", JSON.stringify(values.skills))
            formData.append("clerkid", user!.id);
            formData.append("listingid", project!.id);

            try {
                setIsSubmitting(true)
                const application = await applyProjects(formData)

                if (application.success) {
                    if (application.message === "You have already applied for this project") {
                        toast.error("You have already applied for this project")
                        resetDialog();
                        setApplyDialogOpen(false)
                        return
                    }
                    setCurrentPhase(3)
                    setProgressValue(100)
                } else {
                    toast.error("Failed to apply for project. Please try again")
                    resetDialog();
                    setApplyDialogOpen(false)
                }
            } finally {
                setIsSubmitting(false)
            }
        }
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            resume: resumeURL ?? "",
            cover_letter: "",
            skills: []
        }
    })

    const resetDialog = () => {
        setCurrentPhase(1);
        setProgressValue(33);
        form.reset();
    }

    return (
        <>
            <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="h-full min-w-[40%] ml-auto rounded-none flex flex-col">

                    {/* Header */}
                    <DrawerHeader className="border-b border-slate-300 px-6 py-5 space-y-0">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-col justify-center">
                                <div>
                                    <Image
                                        src={project!.company_logo_url}
                                        width={150}
                                        height={100}
                                        alt="Company Logo"
                                    />
                                </div>
                                <div>
                                    <DrawerTitle className="text-xl font-bold text-[#0f172a] leading-snug">
                                        {project?.title.toUpperCase()}
                                    </DrawerTitle>
                                    <p className="text-sm text-[#2563eb]">{project?.company_name}</p>
                                </div>
                            </div>
                            <Badge className="text-[11px]  bg-green-100 text-green-700 border border-green-100 rounded-full px-3 py-1 shrink-0 mt-1">
                                {project?.status.toUpperCase()}
                            </Badge>
                        </div>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">

                        {/* Details */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-5">
                                <Clock size={15} className="text-slate-400 shrink-0" />
                                <p className="text-sm  text-[#0f172a]">{project?.duration}</p>
                            </div>
                            <div className="flex items-center gap-5">
                                <Users size={15} className="text-slate-400 shrink-0" />
                                <p className="text-sm  text-[#0f172a]">{project?.vacancies} spots available</p>
                            </div>
                            <div className="flex items-center gap-5">
                                <Wallet size={15} className="text-slate-400 shrink-0" />
                                <p className="text-sm  text-[#0f172a]">RM {project?.allowance} / month</p>
                            </div>
                            <div className="flex items-center gap-5">
                                <Calendar size={15} className="text-slate-400 shrink-0" />
                                <p className="text-sm  text-[#0f172a]">
                                    {project?.start_date && new Date(project.start_date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })} to{" "}
                                    {project?.end_date && new Date(project.end_date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        {/* Skills */}
                        <div>
                            <p className="text-sm font-semibold text-[#0f172a] uppercase tracking-widest mb-3">Skills Required</p>
                            <div className="flex flex-wrap gap-2">
                                {project?.skills_required?.map((skill) => (
                                    <Badge key={skill} className="px-4 py-2 text-sm">{skill}</Badge>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Description */}
                        <div>
                            <p className="text-sm font-semibold text-[#0f172a] uppercase tracking-widest mb-3">About This Project</p>
                            <p className="text-sm text-slate-500 leading-relaxed">{project?.description}</p>
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

            <Dialog open={applyDialogOpen} onOpenChange={(open) => {
                if (!open) resetDialog()
                setApplyDialogOpen(open)
            }}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Apply for {project?.title}</DialogTitle>
                        <DialogDescription>Submit your application for this project.</DialogDescription>
                    </DialogHeader>

                    <Field>
                        <FieldLabel htmlFor="progress-upload">
                            <span>Application progress</span>
                            <span className="ml-auto">{progressValue}%</span>
                        </FieldLabel>
                        <Progress value={progressValue} id="progress-upload" />
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
                        {currentPhase !== 3 && (
                            <DialogClose asChild>
                                <Button variant="outline" size="sm" className="cursor-pointer px-4 py-5"
                                    onClick={() => {
                                        setCurrentPhase(1)
                                        setProgressValue(33)
                                    }}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                        )}
                        <Button
                            size="sm"
                            className="cursor-pointer px-4 py-5"
                            disabled={isSubmitting}
                            onClick={currentPhase === 3 ? () => { setApplyDialogOpen(false); resetDialog() } : handleApply}
                        >
                            {currentPhase === 1 ? "Next"
                                : currentPhase === 2 ? (isSubmitting ? "Submitting..." : "Submit Application")
                                    : "Close"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}