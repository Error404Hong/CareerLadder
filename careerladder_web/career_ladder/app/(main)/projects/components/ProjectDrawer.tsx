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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

import { getStudentProfile } from "@/app/api/user"
import { toast } from "sonner"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"


const MAX_FILE_SIZE = 5000000;
const ACCEPTED_FILE_TYPE = ['pdf']

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    project: Project | null
}

const formSchema = z.object({
    resume: z.any()
        .refine((file) => file?.length !== 0, "Resume must be uploaded for employers' reference")
        .refine((file) => file.size < MAX_FILE_SIZE, "File size has exceeded maximum of 5MB ")
        .refine((file) => ACCEPTED_FILE_TYPE.includes(file?.[0].type), "Only PDF is accepted only"),
    cover_letter: z.string(),
    skills: z.array(z.string()).min(1, "Please select at least one skill")
})


export function ProjectDrawer({ open, onOpenChange, project }: Props) {
    const { user } = useUser();
    const [applyDialogOpen, setApplyDialogOpen] = useState<boolean>(false);
    const [resumeURL, setResumeURL] = useState<string>("");
    const [currentPhase, setCurrentPhase] = useState<number>(1);
    const [progressValue, setProgressValue] = useState<number>(33);
    const [skillsRequired, setSkillsRequired] = useState<string[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

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
            setCurrentPhase(2);
            setProgressValue(66);
            setSkillsRequired(project?.skills_required ?? []);
            console.log("project: ", project?.skills_required)
        }

        if (currentPhase === 2) {
            setCurrentPhase(3);
            setProgressValue(100);
        }
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            resume: "",
            cover_letter: "",
            skills: []
        }
    })

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
                                        src="/careerladder-logo.png"
                                        width={300}
                                        height={300}
                                        alt="Company Logo"
                                        className="mb-5"
                                    />
                                </div>
                                <div>
                                    <DrawerTitle className="text-xl font-bold text-[#0f172a] leading-snug">
                                        PROJECT SCOPE: {project?.title.toUpperCase()}
                                    </DrawerTitle>
                                    <p className="text-sm text-[#2563eb] font-medium mt-0.5">{project?.company_id}</p>
                                </div>
                            </div>
                            <Badge className="text-[11px] font-medium bg-green-100 text-green-700 border border-green-100 rounded-full px-3 py-1.5 shrink-0 mt-1">
                                {project?.status.toUpperCase()}
                            </Badge>
                        </div>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">

                        {/* Details */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-5">
                                <Clock size={15} className="text-slate-400 shrink-0" />
                                <p className="text-sm font-medium text-[#0f172a]">{project?.duration}</p>
                            </div>
                            <div className="flex items-center gap-5">
                                <Users size={15} className="text-slate-400 shrink-0" />
                                <p className="text-sm font-medium text-[#0f172a]">{project?.vacancies} spots available</p>
                            </div>
                            <div className="flex items-center gap-5">
                                <Wallet size={15} className="text-slate-400 shrink-0" />
                                <p className="text-sm font-medium text-[#0f172a]">RM {project?.allowance} / month</p>
                            </div>
                            <div className="flex items-center gap-5">
                                <Calendar size={15} className="text-slate-400 shrink-0" />
                                <p className="text-sm font-medium text-[#0f172a]">
                                    {project?.start_date && new Date(project.start_date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })} to{" "}
                                    {project?.end_date && new Date(project.end_date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                            </div>
                        </div>

                        <div className="h-px bg-slate-300" />

                        {/* Skills */}
                        <div>
                            <p className="text-sm font-semibold text-[#0f172a] uppercase tracking-widest mb-3">Skills Required</p>
                            <div className="flex flex-wrap gap-2">
                                {project?.skills_required?.map((skill) => (
                                    <Badge key={skill} className="px-4 py-2 text-sm">{skill}</Badge>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-slate-300" />

                        {/* Description */}
                        <div>
                            <p className="text-sm font-semibold text-[#0f172a] uppercase tracking-widest mb-3">About This Project</p>
                            <p className="text-sm text-slate-500 leading-relaxed">{project?.description}</p>
                        </div>

                    </div>

                    <DrawerFooter className="flex flex-row gap-3 border-t border-slate-300 px-6 py-4">
                        <DrawerClose asChild>
                            <Button size="sm" variant="outline" className="flex-1 cursor-pointer">
                                Close
                            </Button>
                        </DrawerClose>
                        <Button size="sm" className="flex-1 cursor-pointer" onClick={() => handleApply()}>
                            Apply Now
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
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
                                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                                            <FileText size={14} className="text-slate-400 shrink-0" />
                                            <p className="text-xs text-slate-500 flex-1 truncate">{resumeURL ?? "No resume uploaded"}</p>
                                            <span className="text-[11px] text-green-600 font-medium shrink-0">Default</span>
                                        </div>
                                        <Label className="flex items-center gap-1.5 text-xs text-[#2563eb] cursor-pointer hover:underline">
                                            <Upload size={11} /> Upload a different resume
                                            <input type="file" className="hidden" accept=".pdf" />
                                        </Label>
                                    </>
                                ) : (
                                    <Input type="file" accept=".pdf" />
                                )}
                            </Field>

                            <Field>
                                <Label>Cover Letter <span className="text-slate-400">(optional)</span></Label>
                                <Textarea placeholder="Tell the company why you're a great fit..." />
                            </Field>
                        </FieldGroup>
                    )}

                    {currentPhase === 2 && (
                        <FieldGroup>
                            <Label>Select the skills you can contribute to this project</Label>
                            {skillsRequired.map((skill) => (
                                <div key={skill} className="flex items-center gap-2">
                                    <Checkbox
                                        id={skill}
                                        checked={selectedSkills.includes(skill)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedSkills([...selectedSkills, skill]);
                                            } else {
                                                setSelectedSkills(selectedSkills.filter(s => s !== skill));
                                            }
                                        }}
                                    />
                                    <Label htmlFor={skill}>{skill}</Label>
                                </div>
                            ))}
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
                            onClick={currentPhase === 3 ? () => setApplyDialogOpen(false) : handleApply}
                        >
                            {currentPhase === 1 ? "Next" : currentPhase === 2 ? "Submit Application" : "Close"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}