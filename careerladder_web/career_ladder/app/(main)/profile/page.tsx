"use client"

import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Globe, Pencil, Mail, MapPin, Briefcase, GraduationCap, Code2, Languages, FileText, ChevronDown, Plus, Trash2, Upload, Info, Download } from "lucide-react"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    getUserById, getStudentProfile, modifyUserProfile, modifyProfileSummary, getStudentEducation,
    addNewEducation, deleteEducation, editEducation, getStudentExperience, addNewExperience, deleteExperience, editExperience,
    saveResume, deleteResume, getStudentSkills, addNewSkill, removeSkill, getLanguages, addLanguage, deleteLanguage
} from "@/app/api/user"

import { DeleteDialog } from "./delete/DeleteDialog"
import ProfileForm, { formSchema, type ProfileFormValues, jobTypes } from "./forms/ProfileForm"
import SummaryForm, { summaryFormSchema, type SummaryFormValues } from "./forms/SummaryForm"
import EducationForm, { educationFormSchema, type EducationFormValues } from "./forms/EducationForm"
import ExperienceForm, { experienceFormSchema, type ExperienceFormValues, jobTypes as workTypes } from "./forms/ExperienceForm"
import SkillForm, { skillsFormSchema, type SkillsFormValues } from "./forms/SkillsForm"
import LanguageForm, { languageFormSchema, type LanguageFormValues, proficiencyLevels } from "./forms/LanguageForm"


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

type Experience = {
    id: number,
    clerk_id: string,
    jobtitle: string,
    job_description: string,
    company: string,
    start_year: string
    end_year: string | null
    is_current: boolean,
    location: string,
    employment_type: string
}

type Skills = {
    id: number,
    clerk_id: string,
    name: string,
}

type Language = {
    id: number,
    clerk_id: string,
    language: string,
    proficiency: string,
}

type DeleteTarget = {
    id?: number,
    label: string,
    type: "education" | "experience" | "skill" | "language" | "resume"
}

type EditTarget = {
    type: "education" | "experience"
    data: Education | Experience
}

export default function Profile() {
    const { user } = useUser()
    const [cid, setCid] = useState("");
    const [fname, setFname] = useState("")
    const [lname, setLname] = useState("")
    const [email, setEmail] = useState("")
    const [major, setMajor] = useState("");
    const [resumeURL, setResumeURL] = useState("");
    const [job_type, setJobtype] = useState("");
    const [linkedinURL, setLinkedinURL] = useState("");
    const [workStatus, setWorkStatus] = useState<boolean | undefined>(undefined);
    const [location, setLocation] = useState("");
    const [summary, setSummary] = useState("");
    const [education, setEducation] = useState<Education[]>([]);
    const [experience, setExperience] = useState<Experience[]>([]);
    const [skills, setSkills] = useState<Skills[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
    const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(0);

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

    const experienceForm = useForm<ExperienceFormValues>({
        resolver: zodResolver(experienceFormSchema),
        defaultValues: {
            jobtitle: "",
            jobdescription: "",
            company: "",
            start_year: "",
            end_year: "",
            is_current: false,
            location: "",
            employment_type: ""
        }
    })

    const skillForm = useForm<SkillsFormValues>({
        resolver: zodResolver(skillsFormSchema),
        defaultValues: {
            name: ""
        }
    })

    const languageForm = useForm<LanguageFormValues>({
        resolver: zodResolver(languageFormSchema),
        defaultValues: {
            language: "",
            proficiency: ""
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
                const userExperience = await getStudentExperience(user.id);
                const userSkills = await getStudentSkills(user.id);
                const userLanguages = await getLanguages(user.id);

                if (userProfile) {
                    setMajor(userProfile.data.major ?? "Not Specified Yet");
                    setLocation(userProfile.data.location ?? "Not Specified Yet");
                    setLinkedinURL(userProfile.data.linkedin_url ?? "No Link Provided Yet");
                    setWorkStatus(userProfile.data.work_status ?? false);
                    setJobtype(userProfile.data.job_preference ?? "");
                    setSummary(userProfile.data.profile_summary ?? "");
                    setResumeURL(userProfile.data.resume ?? "");

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
                    setEducation(userEducation.data ?? []);
                }

                if (userExperience) {
                    setExperience(userExperience.data ?? []);
                }

                if (userSkills) {
                    setSkills(userSkills.data ?? []);
                }

                if (userLanguages) {
                    setLanguages(userLanguages.data ?? []);
                }
            }
        }

        getUser()
    }, [user, form, summaryForm])

    const clearEditState = () => {
        setIsEditMode(false)
        setEditId(0)
        setEditTarget(null)
    }

    const openDialog = (type: string) => {
        if (type === "education") {
            educationForm.reset({
                institution: "",
                field: "",
                start_year: "",
                end_year: "",
                is_current: false,
            })
        }

        if (type === "experience") {
            experienceForm.reset({
                jobtitle: "",
                company: "",
                start_year: "",
                end_year: "",
                is_current: false,
                location: "",
                employment_type: "",
                jobdescription: ""
            })
        }

        if (type === "skill") {
            skillForm.reset({ name: "" })
        }
        if (type === "language") {
            languageForm.reset({ language: "", proficiency: "" })
        }

        clearEditState()
        setDialogType(type)
        setDialogOpen(true)
    }

    const openEditDialog = (type: "education" | "experience", id: number, target: EditTarget, formValues: EducationFormValues | ExperienceFormValues) => {
        setIsEditMode(true)
        setEditId(id)
        setEditTarget(target)
        if (type === "education") {
            educationForm.reset(formValues as EducationFormValues)
        }
        if (type === "experience") {
            experienceForm.reset(formValues as ExperienceFormValues)
        }
        setDialogType(type)
        setDialogOpen(true)
    }

    const openDeleteDialog = () => {
        setDeleteDialogOpen(true)
    }

    const submitForm = async (values: ProfileFormValues) => {
        if (dialogType === "profile") {
            const updRes = await modifyUserProfile(values.linkedin_url, values.location, values.major, values.jobtype, values.work_status, cid);

            if (updRes.success) {
                setLocation(values.location);
                setLinkedinURL(values.linkedin_url);
                setMajor(values.major);
                setJobtype(values.jobtype);
                setWorkStatus(values.work_status)
                toast.success("Profile has been updated successfully")
            } else {
                toast.error("Failed to update profile. Please try again")
            }
        }
        setDialogOpen(false)
    }

    const submitSummaryForm = async (values: SummaryFormValues) => {
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

        if (isEditMode) {
            const currentEditId = editId // capture before clearing
            const updEducation = await editEducation(
                values.institution,
                values.field,
                values.start_year,
                values.end_year ?? null,
                values.is_current,
                currentEditId
            )

            if (updEducation.success) {
                setEducation(prev => prev.map(e => e.id === currentEditId ? updEducation.data : e))
                toast.success("Education Record Updated Successfully")
                clearEditState()
            } else {
                toast.error("Failed to Edit Education Record. Please try again")
            }
        } else {
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
            } else {
                toast.error("Failed to add new education. Please try again")
            }
        }

        setDialogOpen(false)
    }

    const submitExperienceForm = async (values: ExperienceFormValues) => {
        const sYear = Number(values.start_year);
        const eYear = Number(values.end_year);

        if (!values.is_current && !values.end_year) {
            toast.error("Please provide an end year or check 'Currently working here'")
            return
        }

        if (!values.is_current && sYear > eYear) {
            toast.error("Start year cannot be later than end year")
            return
        }

        if (isEditMode) {
            const currentEditId = editId // capture before clearing
            const updExp = await editExperience(
                values.jobtitle,
                values.company,
                values.start_year,
                values.end_year,
                values.is_current,
                values.jobdescription,
                values.location,
                values.employment_type,
                currentEditId
            );

            if (updExp.success) {
                setExperience(prev => prev.map(e => e.id === currentEditId ? updExp.data : e))
                toast.success("Work experience has been edited successfully")
                clearEditState()
            } else {
                toast.error("Failed to edit work experience. Please try again")
            }
        } else {
            const addExperience = await addNewExperience(cid, values.jobtitle, values.company, values.start_year, values.end_year ?? null, values.is_current, values.jobdescription, values.location, values.employment_type);

            if (addExperience.success) {
                setExperience(prev => [...prev, addExperience.data]);
                toast.success("Experience has been added successfully");
            } else {
                toast.error("Failed to add work experience. Please try again")
            }
        }

        setDialogOpen(false);
    }

    const submitSkillForm = async (values: SkillsFormValues) => {
        try {
            const addSkill = await addNewSkill(cid, values.name);

            if (addSkill.success) {
                setSkills(prev => [...prev, addSkill.data]);
                toast.success("New skill has been added successfully")
            } else {
                toast.error("Failed to add new skill. Please try again")
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
            throw error;
        } finally {
            setDialogOpen(false)
        }
    }

    const submitLanguageForm = async (values: LanguageFormValues) => {
        console.log("Submitting: ", values)

        try {
            const result = await addLanguage(cid, values.language, values.proficiency)

            if (result.success) {
                setLanguages(prev => [...prev, result.data])
                toast.success("Language added successfully")
                setDialogOpen(false)
            } else {
                toast.error("Failed to add language. Please try again")
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again");
            throw error;
        }
    }

    const uploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Only PDF files are allowed");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB")
            return;
        }

        try {
            console.log("Uploading resume: ", file);
            const formData = new FormData();
            formData.append("resume", file);

            const result = await saveResume(formData, cid);
            if (result.success) {
                setResumeURL(result.data.resume);
                toast.success("Resume uploaded successfully")
            } else {
                toast.error("Failed to upload resume. Please try again")
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again");
        }

    }

    const deleteRecord = async (values: DeleteTarget) => {
        if (!deleteTarget) {
            toast.error("Something went wrong.");
            return;
        }

        if (values.type === "education") {
            const deleteEdu = await deleteEducation(values.id!);

            if (deleteEdu.success) {
                setEducation(prev => prev.filter(e => e.id !== values.id))
                toast.success("Education has been deleted successfully")
            } else {
                toast.error("Failed to delete the education record")
            }
        }

        if (values.type === "experience") {
            const deleteExp = await deleteExperience(values.id!);

            if (deleteExp.success) {
                setExperience(prev => prev.filter(e => e.id !== values.id!))
                toast.success("Work experience has been deleted successfully");
            } else {
                toast.error("Failed to delete the work experience record")
            }
        }

        if (values.type === "resume") {
            const delResume = await deleteResume(cid);

            if (delResume.success) {
                setResumeURL("");
                toast.success("Resume has been deleted successfully");
            } else {
                toast.error("Failed to delete resume");
            }
        }

        if (values.type === "skill") {
            const delSkill = await removeSkill(values.id!);

            if (delSkill.success) {
                setSkills(prev => prev.filter(e => e.id !== values.id!));
                toast.success("The skill has been removed successfully")
            } else {
                toast.error("Failed to remove the skill")
            }
        }

        if (values.type === "language") {
            const delLangauge = await deleteLanguage(values.id!);

            if (delLangauge.success) {
                setLanguages(prev => prev.filter(e => e.id !== values.id!));
                toast.success("Language has been removed successfully")
            } else {
                toast.error("Failed to remove the language")
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
                            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-sm mt-2">
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
                                <div className="flex items-center gap-2.5 text-sm text-slate-500">
                                    <Mail size={12} className="text-slate-300 shrink-0" />
                                    <span>{email || "No email"}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-sm text-slate-500">
                                    <Globe size={12} className="text-slate-300 shrink-0" />
                                    <span className="text-[#2563eb]">
                                        {linkedinURL || "No LinkedIn URL"}
                                    </span>
                                </div>
                            </div>
                            <div className="h-px bg-slate-100 my-4" />
                            <button
                                className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500 border border-slate-200 rounded-xl py-2.5 hover:border-[#0f172a] hover:text-[#0f172a] transition-colors"
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

                            {resumeURL ? (
                                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                                    <div className="w-9 h-9 rounded-lg bg-[#0f172a] flex items-center justify-center shrink-0">
                                        <FileText size={13} className="text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#0f172a] truncate">{resumeURL.split("/").pop()}</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Uploaded</p>
                                    </div>
                                    <a href={resumeURL} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-[#2563eb] transition-colors cursor-pointer">
                                        <Download size={15} />
                                    </a>
                                    <button className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                                        onClick={() => {
                                            openDeleteDialog()
                                            setDeleteTarget({ label: "Resume", type: "resume" })
                                        }}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 gap-2 bg-slate-50 border border-slate-200 rounded-xl">
                                    <FileText size={24} className="text-slate-400" />
                                    <p className="text-sm text-slate-400 font-medium">No resume uploaded yet</p>
                                    <p className="text-sm text-slate-400">Upload a PDF to showcase your experience</p>
                                </div>
                            )}

                            <label className="mt-3 w-full flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500 border border-dashed border-slate-200 hover:border-[#0f172a] hover:text-[#0f172a] rounded-xl py-2.5 cursor-pointer transition-colors">
                                <Upload size={11} /> {resumeURL ? "Replace Resume" : "Upload Resume"}
                                <input type="file" className="hidden" accept=".pdf" onChange={uploadResume} />
                            </label>
                        </CardContent>
                    </Card>

                    {/* Profile completion */}
                    {/* <Card className="rounded-2xl border border-slate-100 shadow-sm">
                        <CardContent className="px-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-[#0f172a] text-sm">Profile Strength</span>
                                <span className="text-sm font-bold text-[#2563eb]">83%</span>
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
                                        <span className={`text-sm ${item.done ? "text-slate-600" : "text-slate-400"}`}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card> */}
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
                                    <p className="text-sm text-slate-300">Click Edit to add a profile summary</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Experience */}
                    <Collapsible defaultOpen className="group">
                        <Card className="rounded-2xl border border-slate-100 shadow-sm">
                            <CollapsibleTrigger className="w-full px-6 pb-4 border-b border-slate-100">
                                <SectionHeader icon={<Briefcase size={13} />} title="Work Experience" onAdd={() => openDialog("experience")} />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="px-6 flex flex-col gap-5">
                                    {experience.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                                            <Briefcase size={28} className="text-slate-200" />
                                            <p className="text-sm text-slate-400 font-medium">No experience added yet</p>
                                            <p className="text-sm text-slate-300">Click Add to add your work experience</p>
                                        </div>
                                    ) : (
                                        experience.map((exp, i, arr) => (
                                            <div key={exp.id} className={`flex gap-4 ${i < arr.length - 1 ? "pb-5 border-b border-slate-100" : ""}`}>
                                                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Briefcase size={14} className="text-slate-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="font-semibold text-[#0f172a] text-sm">{exp.jobtitle}</p>
                                                            <p className="text-sm text-[#2563eb] font-medium mt-0.5">{exp.company}</p>
                                                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                                                <Badge variant="outline" className="text-[11px] text-slate-500 font-normal">
                                                                    {workTypes.find(j => j.value === exp.employment_type)?.label ?? exp.employment_type}
                                                                </Badge>
                                                                {exp.location && (
                                                                    <Badge variant="outline" className="text-[11px] text-slate-500 font-normal">
                                                                        {exp.location}
                                                                    </Badge>
                                                                )}
                                                                <Badge variant="outline" className="text-[11px] text-slate-500 font-normal">
                                                                    {exp.start_year} — {exp.is_current ? "Present" : exp.end_year}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1.5">
                                                            <button
                                                                className="text-slate-500 hover:text-slate-400 transition-colors"
                                                                onClick={() => openEditDialog(
                                                                    "experience",
                                                                    exp.id,
                                                                    { type: "experience", data: exp },
                                                                    {
                                                                        jobtitle: exp.jobtitle,
                                                                        company: exp.company,
                                                                        location: exp.location,
                                                                        employment_type: exp.employment_type,
                                                                        jobdescription: exp.job_description,
                                                                        start_year: exp.start_year,
                                                                        end_year: exp.end_year ?? "",
                                                                        is_current: exp.is_current,
                                                                    }
                                                                )}
                                                            >
                                                                <Pencil size={15} />
                                                            </button>
                                                            <button
                                                                className="text-slate-500 hover:text-red-400 transition-colors"
                                                                onClick={() => {
                                                                    openDeleteDialog()
                                                                    setDeleteTarget({ id: exp.id, label: `${exp.jobtitle} at ${exp.company}`, type: "experience" })
                                                                }}
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-slate-500 leading-relaxed mt-2">{exp.job_description}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
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
                                            <p className="text-sm text-slate-300">Click Add to add your education history</p>
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
                                                            <p className="text-sm text-[#2563eb] font-medium mt-0.5">{edu.institution}</p>
                                                            <p className="text-sm text-slate-400 mt-0.5">
                                                                {edu.field} · {edu.start_year} — {edu.is_current ? "Present" : edu.end_year}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-1.5">
                                                            <button
                                                                className="text-slate-500 hover:text-slate-400 transition-colors"
                                                                onClick={() => openEditDialog(
                                                                    "education",
                                                                    edu.id,
                                                                    { type: "education", data: edu },
                                                                    {
                                                                        institution: edu.institution,
                                                                        field: edu.field,
                                                                        start_year: edu.start_year,
                                                                        end_year: edu.end_year ?? "",
                                                                        is_current: edu.is_current,
                                                                    }
                                                                )}
                                                            >
                                                                <Pencil size={15} />
                                                            </button>
                                                            <button
                                                                className="text-slate-500 hover:text-red-400 transition-colors"
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
                                <SectionHeader icon={<Code2 size={13} />} title="Skills" onAdd={() => openDialog("skill")} />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="px-6">
                                    {skills.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                                            <Code2 size={28} className="text-slate-200" />
                                            <p className="text-sm text-slate-400 font-medium">No skills added yet</p>
                                            <p className="text-sm text-slate-300">Click Add to add your skills</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map((skill) => (
                                                <span key={skill.id} className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 hover:border-[#0f172a] hover:text-[#0f172a] transition-colors">
                                                    {skill.name}
                                                    <button
                                                        className="text-slate-300 hover:text-red-400 transition-colors"
                                                        onClick={() => {
                                                            setDeleteTarget({ id: skill.id, label: skill.name, type: "skill" })
                                                            setDeleteDialogOpen(true)
                                                        }}
                                                    >
                                                        <span className="text-[10px]">✕</span>
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>

                    {/* Languages */}
                    <Collapsible defaultOpen className="group">
                        <Card className="rounded-2xl border border-slate-100 shadow-sm">
                            <CollapsibleTrigger className="w-full px-6 pb-4 border-b border-slate-100">
                                <SectionHeader icon={<Languages size={13} />} title="Languages" onAdd={() => openDialog("language")} />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="px-6 flex flex-col gap-3">
                                    {languages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                                            <Languages size={28} className="text-slate-200" />
                                            <p className="text-sm text-slate-400 font-medium">No languages added yet</p>
                                            <p className="text-sm text-slate-300">Click Add to add your languages</p>
                                        </div>
                                    ) : (
                                        languages.map((l) => {
                                            const pct = proficiencyLevels.find(p => p.value === l.proficiency)?.pct ?? 0
                                            return (
                                                <div key={l.id} className="flex items-center gap-4">
                                                    <div className="w-28 shrink-0">
                                                        <p className="text-sm font-medium text-[#0f172a]">{l.language}</p>
                                                        <p className="text-[11px] text-slate-400 capitalize">{l.proficiency}</p>
                                                    </div>
                                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-linear-to-r from-[#0f172a] to-[#2563eb] rounded-full" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <button
                                                        className="text-slate-500 hover:text-red-400 transition-colors shrink-0 cursor-pointer"
                                                        onClick={() => {
                                                            setDeleteTarget({ id: l.id, label: l.language, type: "language" })
                                                            setDeleteDialogOpen(true)
                                                        }}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            )
                                        })
                                    )}
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
                            summaryForm.reset({ summary })
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
                        if (!open) clearEditState()
                        setDialogOpen(open)
                    }}
                    form={educationForm}
                    onSubmit={submitEducationForm}
                    mode={isEditMode ? "edit" : "add"}
                />
            )}

            {dialogType === "experience" && (
                <ExperienceForm
                    open={dialogOpen}
                    onOpenChange={(open) => {
                        if (!open) clearEditState()
                        setDialogOpen(open)
                    }}
                    form={experienceForm}
                    onSubmit={submitExperienceForm}
                    mode={isEditMode ? "edit" : "add"}
                />
            )}

            {dialogType === "skill" && (
                <SkillForm
                    open={dialogOpen}
                    onOpenChange={(open) => {
                        if (!open) {
                            skillForm.reset({ name: "" })
                        }
                        setDialogOpen(open)
                    }}
                    form={skillForm}
                    onSubmit={submitSkillForm}
                />
            )}

            {dialogType === "language" && (
                <LanguageForm
                    open={dialogOpen}
                    onOpenChange={(open) => {
                        if (!open) {
                            languageForm.reset({
                                language: "",
                                proficiency: ""
                            })
                        }
                        setDialogOpen(open)
                    }}
                    form={languageForm}
                    onSubmit={submitLanguageForm}

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
