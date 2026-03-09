"use client"

import { toast } from "sonner"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Globe, Pencil, Mail, MapPin, Briefcase, GraduationCap, Code2, Languages, FileText, ChevronDown, Plus, Trash2, Upload, Info } from "lucide-react"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { getUserById, getStudentProfile, modifyUserProfile, modifyProfileSummary, getStudentEducation, addNewEducation, deleteEducation } from "@/app/api/user"

import { DeleteDialog } from "./delete/DeleteDialog"
import ProfileForm, { formSchema, type ProfileFormValues, jobTypes } from "./forms/ProfileForm"
import SummaryForm, { summaryFormSchema, type SummaryFormValues } from "./forms/SummaryForm"
import EducationForm, { educationFormSchema, type EducationFormValues } from "./forms/EducationForm"


const SectionHeader = ({ icon, title, onAdd }: { icon: React.ReactNode; title: string; onAdd?: () => void }) => (
    <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-[#0f172a] flex items-center justify-center text-white shrink-0">
                {icon}
            </span>
            <span className="font-semibold text-[#0f172a] text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-2">
            <div
                className="flex items-center gap-1 text-[11px] font-medium text-[#2563eb] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation()
                    onAdd?.()
                }}
            >
                <Plus size={11} /> Add
            </div>
            <ChevronDown size={15} className="text-slate-500 transition-transform duration-200 group-data-[state=open]:rotate-180 cursor-pointer" />
        </div>
    </div>
)

type Education = {
    id: number
    clerk_id: string
    institution: string
    field: string
    start_year: string
    end_year: string | null
    is_current: boolean
}

type DeleteTarget = {
    id: number,
    label: string,
    type: "education" | "experience" | "skill" | "language"
}

export default function Profile() {
    const { user } = useUser()
    const [cid, setCid] = useState("");
    const [fname, setFname] = useState("")
    const [lname, setLname] = useState("")
    const [email, setEmail] = useState("")
    const [major, setMajor] = useState("");
    const [job_type, setJobtype] = useState("");
    const [linkedinURL, setLinkedinURL] = useState("");
    const [workStatus, setWorkStatus] = useState<boolean | undefined>(undefined);
    const [location, setLocation] = useState("");
    const [summary, setSummary] = useState("");
    const [education, setEducation] = useState<Education[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fname: "",
            lname: "",
            email: "",
            major: "",
            jobtype: "",
            linkedin_url: "",
            work_status: false,
            location: ""
        }
    })

    const summaryForm = useForm<SummaryFormValues>({
        resolver: zodResolver(summaryFormSchema),
        defaultValues: {
            summary: ""
        }
    })

    const educationForm = useForm<EducationFormValues>({
        resolver: zodResolver(educationFormSchema),
        defaultValues: {
            institution: "",
            field: "",
            start_year: "",
            end_year: "",
            is_current: false,
        }
    })

    useEffect(() => {
        const getUser = async () => {
            if (!user) return

            const userData = await getUserById(user.id)
            if (userData) {
                setCid(user.id || "");
                setFname(user.firstName || "Unknown")
                setLname(user.lastName || "Unknown")
                setEmail(user.emailAddresses[0]?.emailAddress || "None")

                const userProfile = await getStudentProfile(user.id);
                const userEducation = await getStudentEducation(user.id);

                if (userProfile) {
                    setMajor(userProfile.data.major ?? "Not Specified Yet");
                    setLocation(userProfile.data.location ?? "Not Specified Yet");
                    setLinkedinURL(userProfile.data.linkedin_url ?? "No Link Provided Yet");
                    setWorkStatus(userProfile.data.work_status ?? false);
                    setJobtype(userProfile.data.job_preference ?? "");
                    setSummary(userProfile.data.profile_summary ?? "");

                    form.reset({
                        fname: user.firstName || "Unknown",
                        lname: user.lastName || "Unknown",
                        email: user.emailAddresses[0]?.emailAddress || "None",
                        major: userProfile.data.major ?? "Not Specified Yet",
                        jobtype: userProfile.data.job_preference ?? "",
                        linkedin_url: userProfile.data.linkedin_url ?? "No Link Provided Yet",
                        work_status: userProfile.data.work_status ?? false,
                        location: userProfile.data.location ?? "Not Specified Yet"
                    })

                    summaryForm.reset({
                        summary: userProfile.data.profile_summary ?? ""
                    })
                }

                if (userEducation) {
                    setEducation(userEducation.data);
                }
            }
        }

        getUser()
    }, [user, form, summaryForm])

    const openDialog = (type: string) => {
        setDialogType(type)
        setDialogOpen(true)
    }

    const openDeleteDialog = () => {
        setDeleteDialogOpen(true)
    }

    const submitForm = async (values: ProfileFormValues) => {
        console.log("Submitting", values)
        if (dialogType === "profile") {
            const updRes = await modifyUserProfile(values.linkedin_url, values.location, values.major, values.jobtype, values.work_status, cid);

            if (updRes.success) {
                // setFname(values.fname);
                // setLname(values.lname);
                // setEmail(values.email);
                setLocation(values.location);
                setLinkedinURL(values.linkedin_url);
                setMajor(values.major);
                setJobtype(values.jobtype);
                setWorkStatus(values.work_status)
                toast.success("Profile has been updated successfully")
            } else {
                console.log("Failed to update profile")
            }
        }
        setDialogOpen(false)
    }

    const submitSummaryForm = async (values: SummaryFormValues) => {
        console.log("Submitting: ", values);

        const updSummary = await modifyProfileSummary(values.summary, cid);

        if (updSummary.success) {
            setSummary(values.summary);
            toast.success("Profile summary has been updated successfully");
        } else {
            toast.error("Failed to update profile summary")
        }

        setDialogOpen(false);
    }

    const submitEducationForm = async (values: EducationFormValues) => {
        console.log("Submitting: ", values);
        const sYear = Number(values.start_year);
        const eYear = Number(values.end_year);

        if (!values.is_current && !values.end_year) {
            toast.error("Please provide an end year or check 'Currently studying here'")
            return
        }

        if (!values.is_current && sYear > eYear) {
            toast.error("Start year cannot be later than end year")
            return
        }

        if (!values.is_current && sYear === eYear) {
            toast.error("Start and end year cannot be the same")
            return
        }

        const addEducation = await addNewEducation(
            cid,
            values.institution,
            values.field,
            values.start_year,
            values.end_year ?? null,
            values.is_current
        )

        if (addEducation.success) {
            setEducation(prev => [...prev, addEducation.data])
            toast.success("Education has been added successfully")
            setDialogOpen(false)
        } else {
            toast.error("Failed to add new education. Please try again")
        }
    }

    const deleteRecord = async (values: DeleteTarget) => {
        if (!deleteTarget) {
            toast.error("Something went wrong.");
            return;
        }

        if (values.type === "education") {
            const deleteEdu = await deleteEducation(values.id);

            if (deleteEdu.success) {
                setEducation(prev => prev.filter(e => e.id !== values.id))
                toast.success("Deleted Successfully")
            } else {
                toast.error("Failed to delete the education record")
            }
        }

        setDeleteDialogOpen(false)


    }

    const jobLabel = jobTypes.find(j => j.value === job_type)?.label || "Not specified";

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-8 flex gap-0">

                {/* ── LEFT SIDE ── */}
                <div className="w-[35%] flex flex-col px-5 py-3.5 gap-4">
                    <Card className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                        <CardHeader className="p-0 space-y-0">
                            <div className="h-24 bg-linear-to-br from-[#0f172a] to-[#2563eb] relative" />
                            <div className="flex justify-center -mt-10 pb-1 relative z-10">
                                <div className="w-20 h-20 rounded-2xl border-4 border-white bg-linear-to-br from-[#0f172a] to-[#2563eb] shadow-md flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">
                                        {fname?.charAt(0) || "?"}
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 pt-3 text-center">
                            <h2 className="text-lg font-bold text-[#0f172a]">{fname} {lname}</h2>
                            <p className="text-sm text-[#2563eb] font-medium mt-0.5">{major} Student</p>
                            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mt-2">
                                <MapPin size={11} /><span>{location}</span>
                            </div>
                            <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                    {workStatus ? "Open to Work" : "Unavailable"}
                                </span>
                                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                    {jobLabel}
                                </span>
                            </div>
                            <div className="h-px bg-slate-100 my-4" />
                            <div className="flex flex-col gap-2 text-left">
                                <div className="flex items-center gap-2.5 text-xs text-slate-500">
                                    <Mail size={12} className="text-slate-300 shrink-0" />
                                    <span>{email || "No email"}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-xs text-slate-500">
                                    <Globe size={12} className="text-slate-300 shrink-0" />
                                    <span className="text-[#2563eb]">
                                        {form.getValues("linkedin_url") || "No LinkedIn URL"}
                                    </span>
                                </div>
                            </div>
                            <div className="h-px bg-slate-100 my-4" />
                            <button
                                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-xl py-2.5 hover:border-[#0f172a] hover:text-[#0f172a] transition-colors"
                                onClick={() => openDialog("profile")}
                            >
                                <Pencil size={11} /> Edit Profile
                            </button>
                        </CardContent>
                    </Card>

                    {/* Resume card */}
                    <Card className="rounded-2xl border border-slate-100 shadow-sm">
                        <CardContent className="px-5">
                            <div className="flex items-center gap-2.5 mb-4">
                                <span className="w-7 h-7 rounded-lg bg-[#0f172a] flex items-center justify-center text-white shrink-0">
                                    <FileText size={13} />
                                </span>
                                <span className="font-semibold text-[#0f172a] text-sm">Resume</span>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                                <div className="w-9 h-9 rounded-lg bg-[#0f172a] flex items-center justify-center shrink-0">
                                    <FileText size={13} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-[#0f172a] truncate">alex_johnson_cv.pdf</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Uploaded · 2.1 MB</p>
                                </div>
                                <button className="text-slate-300 hover:text-red-400 transition-colors">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                            <label className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 border border-dashed border-slate-200 hover:border-[#0f172a] hover:text-[#0f172a] rounded-xl py-2.5 cursor-pointer transition-colors">
                                <Upload size={11} /> Replace Resume
                                <input type="file" className="hidden" accept=".pdf" />
                            </label>
                        </CardContent>
                    </Card>

                    {/* Profile completion */}
                    <Card className="rounded-2xl border border-slate-100 shadow-sm">
                        <CardContent className="px-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-[#0f172a] text-sm">Profile Strength</span>
                                <span className="text-xs font-bold text-[#2563eb]">83%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                                <div className="h-full w-[83%] bg-linear-to-r from-[#0f172a] to-[#2563eb] rounded-full" />
                            </div>
                            <div className="flex flex-col gap-2">
                                {[
                                    { label: "Profile summary", done: true },
                                    { label: "Resume uploaded", done: true },
                                    { label: "Work experience", done: true },
                                    { label: "Education", done: true },
                                    { label: "Skills added", done: true },
                                    { label: "Languages", done: false },
                                ].map(item => (
                                    <div key={item.label} className="flex items-center gap-2">
                                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${item.done ? "bg-green-500" : "bg-slate-200"}`}>
                                            {item.done && (
                                                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                    <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className={`text-xs ${item.done ? "text-slate-600" : "text-slate-400"}`}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── RIGHT SIDE ── */}
                <div className="w-[65%] flex flex-col px-5 py-3.5 gap-4">

                    {/* Summary */}
                    <Card className="rounded-2xl border border-slate-100 shadow-sm">
                        <CardContent className="px-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-7 h-7 rounded-lg bg-[#0f172a] flex items-center justify-center text-white">
                                        <Pencil size={13} />
                                    </span>
                                    <span className="font-semibold text-[#0f172a] text-sm">Profile Summary</span>
                                </div>
                                <button
                                    className="flex items-center gap-1 text-[11px] font-medium text-[#2563eb] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                    onClick={() => openDialog("summary")}
                                >
                                    <Pencil size={11} /> Edit
                                </button>
                            </div>
                            {summary ? (
                                <p className="text-sm text-slate-500 leading-relaxed">{summary}</p>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 gap-2">
                                    <Info size={28} className="text-slate-200" />
                                    <p className="text-sm text-slate-400 font-medium">No summary yet</p>
                                    <p className="text-xs text-slate-300">Click Edit to add a profile summary</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Experience */}
                    <Collapsible defaultOpen className="group">
                        <Card className="rounded-2xl border border-slate-100 shadow-sm">
                            <CollapsibleTrigger className="w-full px-6 pb-4 border-b border-slate-100">
                                <SectionHeader icon={<Briefcase size={13} />} title="Work Experience" />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="px-6 flex flex-col gap-5">
                                    {[
                                        {
                                            role: "Frontend Intern",
                                            company: "TechCorp Sdn Bhd",
                                            period: "Jan 2024 — Present",
                                            desc: "Built responsive UI components using React and Tailwind CSS. Collaborated with senior engineers on feature delivery and participated in agile sprints.",
                                        },
                                        {
                                            role: "Junior Web Developer",
                                            company: "Freelance",
                                            period: "Jun 2023 — Dec 2023",
                                            desc: "Developed landing pages and e-commerce solutions for small businesses using Next.js and Stripe integration.",
                                        },
                                    ].map((exp, i, arr) => (
                                        <div key={i} className={`flex gap-4 ${i < arr.length - 1 ? "pb-5 border-b border-slate-100" : ""}`}>
                                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                                                <Briefcase size={14} className="text-slate-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-semibold text-[#0f172a] text-sm">{exp.role}</p>
                                                        <p className="text-xs text-[#2563eb] font-medium mt-0.5">{exp.company}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5">{exp.period}</p>
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                        <button className="text-slate-500 hover:text-slate-400 transition-colors"><Pencil size={15} /></button>
                                                        <button className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 leading-relaxed mt-2">{exp.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>

                    {/* Education */}
                    <Collapsible defaultOpen className="group">
                        <Card className="rounded-2xl border border-slate-100 shadow-sm">
                            <CollapsibleTrigger className="w-full px-6 pb-4 border-b border-slate-100">
                                <SectionHeader icon={<GraduationCap size={13} />} title="Education" onAdd={() => openDialog("education")} />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="px-6 flex flex-col gap-5">
                                    {education.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                                            <GraduationCap size={28} className="text-slate-200" />
                                            <p className="text-sm text-slate-400 font-medium">No education added yet</p>
                                            <p className="text-xs text-slate-300">Click Add to add your education history</p>
                                        </div>
                                    ) : (
                                        education.map((edu, i, arr) => (
                                            <div key={edu.id} className={`flex gap-4 ${i < arr.length - 1 ? "pb-5 border-b border-slate-100" : ""}`}>
                                                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                                                    <GraduationCap size={14} className="text-slate-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="text-xs text-[#2563eb] font-medium mt-0.5">{edu.institution}</p>
                                                            <p className="text-xs text-slate-400 mt-0.5">
                                                                {edu.field} · {edu.start_year} — {edu.is_current ? "Present" : edu.end_year}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-1.5">
                                                            <button className="text-slate-500 hover:text-slate-400 transition-colors"><Pencil size={15} /></button>
                                                            <button className="text-slate-500 hover:text-red-400 transition-colors"
                                                                onClick={() => {
                                                                    openDeleteDialog()
                                                                    setDeleteTarget({ id: edu.id, label: `${edu.institution} - ${edu.field}`, type: "education" })
                                                                }}
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>

                    {/* Skills */}
                    <Collapsible defaultOpen className="group">
                        <Card className="rounded-2xl border border-slate-100 shadow-sm">
                            <CollapsibleTrigger className="w-full px-6 pb-4 border-b border-slate-100">
                                <SectionHeader icon={<Code2 size={13} />} title="Skills" />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="px-6">
                                    <div className="flex flex-wrap gap-2">
                                        {["React", "TypeScript", "Next.js", "Node.js", "PostgreSQL", "TailwindCSS", "Python", "Git", "REST APIs", "Figma"].map(skill => (
                                            <span key={skill} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 hover:border-[#0f172a] hover:text-[#0f172a] transition-colors cursor-default">
                                                {skill}
                                                <button className="text-slate-300 hover:text-red-400 transition-colors"><span className="text-[10px]">✕</span></button>
                                            </span>
                                        ))}
                                        <button className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border border-dashed border-slate-300 text-slate-400 hover:border-[#0f172a] hover:text-[#0f172a] transition-colors">
                                            <Plus size={11} /> Add skill
                                        </button>
                                    </div>
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>

                    {/* Languages */}
                    <Collapsible defaultOpen className="group">
                        <Card className="rounded-2xl border border-slate-100 shadow-sm">
                            <CollapsibleTrigger className="w-full px-6 pb-4 border-b border-slate-100">
                                <SectionHeader icon={<Languages size={13} />} title="Languages" />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="px-6 flex flex-col gap-3">
                                    {[
                                        { lang: "English", level: "Fluent", pct: 90 },
                                        { lang: "Bahasa Malaysia", level: "Native", pct: 100 },
                                        { lang: "Mandarin", level: "Basic", pct: 35 },
                                    ].map((l, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-28 shrink-0">
                                                <p className="text-sm font-medium text-[#0f172a]">{l.lang}</p>
                                                <p className="text-[11px] text-slate-400">{l.level}</p>
                                            </div>
                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-linear-to-r from-[#0f172a] to-[#2563eb] rounded-full" style={{ width: `${l.pct}%` }} />
                                            </div>
                                            <button className="text-slate-200 hover:text-red-400 transition-colors shrink-0">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>

                </div>
            </div>

            {/* ── Profile Form Dialog ── */}
            {dialogType === "profile" && (
                <ProfileForm
                    open={dialogOpen}
                    onOpenChange={(open) => {
                        if (!open) {
                            form.reset({
                                fname,
                                lname,
                                email,
                                major,
                                jobtype: job_type,
                                linkedin_url: linkedinURL,
                                work_status: workStatus,
                                location
                            })
                        }
                        setDialogOpen(open)
                    }}
                    form={form}
                    onSubmit={submitForm}
                />
            )}

            {dialogType === "summary" && (
                <SummaryForm
                    open={dialogOpen}
                    onOpenChange={(open) => {
                        if (!open) {
                            summaryForm.reset({
                                summary
                            })
                        }
                        setDialogOpen(open)
                    }}
                    form={summaryForm}
                    onSubmit={submitSummaryForm}
                />
            )}

            {dialogType === "education" && (
                <EducationForm
                    open={dialogOpen}
                    onOpenChange={(open) => {
                        if (!open) {
                            educationForm.reset({
                                institution: "",
                                field: "",
                                start_year: "",
                                end_year: "",
                                is_current: false,
                            })
                        }
                        setDialogOpen(open)
                    }}
                    form={educationForm}
                    onSubmit={submitEducationForm}
                />
            )}

            {/* DeleteDialog */}
            {deleteDialogOpen && (
                <DeleteDialog
                    open={deleteDialogOpen}
                    onOpenChange={(open) => {
                        setDeleteDialogOpen(open)
                    }}
                    title={`Remove ${(deleteTarget?.type ?? "").charAt(0).toUpperCase() + (deleteTarget?.type ?? "").slice(1)}?`}
                    description={`Are you sure you want to remove "${deleteTarget?.label}"? This action cannot be undone.`}
                    onConfirm={() => deleteRecord(deleteTarget!)}
                />
            )}
        </div>
    )
}
