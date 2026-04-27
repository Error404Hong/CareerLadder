"use client"

import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"


import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, MessageSquareText, ClipboardList, UserRound, FileText, Upload } from "lucide-react"

import { format } from "date-fns"
import { z } from "zod"
import { useForm, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { ProjectReview, ProjectApplicant, Badge } from "@/types"
import { rateStudentPerformance } from "@/app/api/project"
import { awardBadge, awardExperiencePoints, issueCertification } from "@/app/api/rewards"


type Props = {
    reviews: ProjectReview[]
    projectApplicants: ProjectApplicant[]
    employer: string
    projectId: string
    badges: Badge[]
}

const evaluationSchema = z.object({
    student_id: z.string().min(1, "Please select a student"),
    technical_skills: z.number().min(1).max(5),
    communication: z.number().min(1).max(5),
    teamwork: z.number().min(1).max(5),
    problem_solving: z.number().min(1).max(5),
    professionalism: z.number().min(1).max(5),
    overall_rating: z.number().min(1).max(5),
    comments: z.string().min(10, "Please provide at least 10 characters of feedback"),
    badges: z.array(z.string()).min(1, "Please award at least one badge to the student"),
    experience_points: z.number().min(1, "Please award experience points to student"),
    certification: z
        .any()
        .optional()
        .refine(
            (file) => !file?.[0] || file[0].size <= 10 * 1024 * 1024,
            "File must be under 10 MB"
        )
        .refine(
            (file) => !file?.[0] || ["application/pdf", "image/png", "image/jpeg", "image/webp"].includes(file[0].type),
            "Only PDF, PNG, JPG, or WEBP allowed"
        ),
})

type EvaluationFormValues = z.infer<typeof evaluationSchema>

const SKILL_FIELDS: { key: keyof Omit<EvaluationFormValues, "student_id" | "comments" | "overall_rating" | "badges">; label: string }[] = [
    { key: "technical_skills", label: "Technical Skills" },
    { key: "communication", label: "Communication" },
    { key: "teamwork", label: "Teamwork" },
    { key: "problem_solving", label: "Problem Solving" },
    { key: "professionalism", label: "Professionalism" },
]

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const labels: Record<number, string> = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent" }
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    className="cursor-pointer p-0.5 transition-all hover:scale-110 active:scale-95"
                >
                    <Star
                        size={22}
                        className={star <= value ? "fill-amber-400 text-amber-400" : "text-slate-200 hover:text-amber-300 transition-colors"}
                    />
                </button>
            ))}
            <span className="ml-2 text-xs text-slate-400">{labels[value]}</span>
        </div>
    )
}


function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={14} className={star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-500"} />
            ))}
        </div>
    )
}


function ReviewCard({ review }: { review: ProjectReview }) {
    const initials = `${review.first_name[0]}${review.last_name[0]}`.toUpperCase()
    const formattedDate = format(new Date(review.created_at), "MMM d, yyyy")

    return (
        <Card className="rounded-lg border-none shadow-none" style={{ backgroundColor: "var(--color-navy-light)" }}>
            <CardContent className="px-5 py-2 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                            <AvatarImage src={review.profile_image} alt={review.first_name} />
                            <AvatarFallback className="text-xs font-semibold bg-white/10 text-white">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white">{review.first_name} {review.last_name}</span>
                            <span className="text-xs text-slate-400">{review.email}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-slate-400">{formattedDate}</span>
                    </div>
                </div>
                <div className="border-t border-white/10" />
                <p className="text-sm text-slate-300 leading-relaxed">{review.review_text}</p>
                <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        {review.rating} / 5
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}

function EvaluateStudentsForm({ projectApplicants, employer, projectId, badges }: { projectApplicants: ProjectApplicant[]; employer: string; projectId: string; badges: Badge[] }) {
    const form = useForm<EvaluationFormValues>({
        resolver: zodResolver(evaluationSchema),
        defaultValues: {
            student_id: "",
            technical_skills: 3,
            communication: 3,
            teamwork: 3,
            problem_solving: 3,
            professionalism: 3,
            overall_rating: 3,
            comments: "",
            badges: [],
            experience_points: 1,
            certification: undefined,
        },
    })

    const onSubmit = async (values: EvaluationFormValues) => {
        try {
            const rateRes = await rateStudentPerformance(
                values.student_id, employer,
                values.technical_skills, values.communication,
                values.teamwork, values.problem_solving,
                values.professionalism, values.overall_rating,
                values.comments,
            )

            if (rateRes.success && rateRes.message === "duplicate_evaluation") {
                toast.warning("You have already rated this student previously")
                form.reset()
                return
            }

            if (!rateRes.success) {
                toast.error("Failed to submit evaluation. Please try again")
                return
            }

            await Promise.all([
                awardExperiencePoints(values.student_id, values.experience_points),
                issueCertification(values.student_id, projectId, employer, values.certification?.[0]),
                ...values.badges.map(badgeId =>
                    awardBadge(values.student_id, badgeId, projectId, employer)
                ),
            ])

            toast.success("Evaluation submitted successfully")
            form.reset()
        } catch {
            toast.error("Something went wrong. Please try again")
        }
    }

    const selectedId = useWatch({ control: form.control, name: "student_id" })
    const selectedStudent = projectApplicants.find(a => a.clerk_id === selectedId)

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">

            {/* Student selector */}
            <Field>
                <FieldLabel className="text-sm font-semibold text-slate-700 mb-1.5">Select Student</FieldLabel>
                <Controller
                    control={form.control}
                    name="student_id"
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full max-w-sm">
                                {selectedStudent ? (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-5 h-5">
                                            <AvatarImage src={selectedStudent.profile_image} />
                                            <AvatarFallback className="text-[10px]">
                                                {selectedStudent.first_name[0]}{selectedStudent.last_name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm">{selectedStudent.first_name} {selectedStudent.last_name}</span>
                                    </div>
                                ) : (
                                    <SelectValue placeholder="Choose a student..." />
                                )}
                            </SelectTrigger>
                            <SelectContent>
                                {projectApplicants.map((applicant) => (
                                    <SelectItem key={applicant.clerk_id} value={applicant.clerk_id}>
                                        <div className="flex items-center gap-2 py-0.5">
                                            <Avatar className="w-6 h-6">
                                                <AvatarImage src={applicant.profile_image} />
                                                <AvatarFallback className="text-[10px] bg-slate-100">
                                                    {applicant.first_name[0]}{applicant.last_name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{applicant.first_name} {applicant.last_name}</span>
                                                <span className="text-xs text-slate-400">{applicant.email}</span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                <FieldError errors={[form.formState.errors.student_id]} />
            </Field>

            <Separator />

            {/* Skill ratings */}
            <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-slate-700 mb-3">Skill Ratings</p>
                <div className="rounded-xl border border-slate-100 bg-slate-50 divide-y divide-slate-100">
                    {SKILL_FIELDS.map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between px-4 py-3 gap-4">
                            <span className="text-sm text-slate-600 w-36 shrink-0">{label}</span>
                            <Controller
                                control={form.control}
                                name={key}
                                render={({ field }) => (
                                    <StarPicker value={field.value} onChange={field.onChange} />
                                )}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Overall rating */}
            <Field>
                <FieldLabel className="text-sm font-semibold text-slate-700 mb-1.5">Overall Rating</FieldLabel>
                <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                    <Controller
                        control={form.control}
                        name="overall_rating"
                        render={({ field }) => (
                            <StarPicker value={field.value} onChange={field.onChange} />
                        )}
                    />
                </div>
                <FieldError errors={[form.formState.errors.overall_rating]} />
            </Field>

            <div className="flex flex-col gap-4">
                <p className="text-sm font-semibold text-slate-700">Rewards Allocation</p>

                {/* Badges — multi-select via checkboxes */}
                <Controller name="badges" control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Badges</Label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                {badges.map(badge => {
                                    const checked = field.value.includes(badge.id)
                                    return (
                                        <div
                                            key={badge.id}
                                            role="button"
                                            onClick={() => {
                                                if (checked) {
                                                    field.onChange(field.value.filter((id: string) => id !== badge.id))
                                                } else {
                                                    field.onChange([...field.value, badge.id])
                                                }
                                            }}
                                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-colors cursor-pointer ${checked
                                                ? "border-[#2563eb] bg-blue-50 text-[#2563eb]"
                                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                                }`}
                                        >
                                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-[#2563eb] border-[#2563eb]" : "border-slate-300 bg-white"
                                                }`}>
                                                {checked && (
                                                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                                        <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="text-xs font-medium leading-snug">{badge.name}</span>
                                        </div>
                                    )
                                })}
                            </div>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                {/* XP */}
                <Controller name="experience_points" control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Experience Points (XP)</Label>
                            <Input
                                {...field}
                                type="number"
                                min={1}
                                max={500}
                                className="w-full"
                                aria-invalid={fieldState.invalid}
                                onChange={(e) => field.onChange(e.target.value === "" ? 1 : Number(e.target.value))}
                            />
                            <FieldDescription>Max 500 points</FieldDescription>

                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
            </div>

            {/* Comments */}
            <Field>
                <FieldLabel className="text-sm font-semibold text-slate-700 mb-1.5">Comments</FieldLabel>
                <Controller
                    control={form.control}
                    name="comments"
                    render={({ field, fieldState }) => (
                        <div className="flex flex-col gap-1.5">
                            <Textarea
                                {...field}
                                aria-invalid={fieldState.invalid}
                                placeholder="Describe the student's contribution, strengths, and areas for improvement..."
                                className="min-h-28 resize-none"
                                maxLength={1000}
                            />
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-400">Minimum 10 characters required</p>
                                <p className={`text-xs ${field.value.length > 900 ? "text-amber-500 font-medium" : "text-slate-400"}`}>
                                    {field.value.length} / 1000
                                </p>
                            </div>
                        </div>
                    )}
                />
                <FieldError errors={[form.formState.errors.comments]} />
            </Field>

            {/* Certification upload */}
            <Controller name="certification" control={form.control}
                render={({ field, fieldState }) => {
                    const file = field.value?.[0] as File | undefined
                    const isImage = file && file.type.startsWith("image/")
                    return (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel className="text-sm font-semibold text-slate-700 mb-1.5">
                                Certification File <span className="text-slate-400 font-normal">(optional)</span>
                            </FieldLabel>
                            <label
                                className={`flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed px-4 py-6 cursor-pointer transition-colors ${fieldState.invalid
                                    ? "border-red-300 bg-red-50"
                                    : file
                                        ? "border-[#2563eb] bg-blue-50"
                                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                                    }`}
                            >
                                <input
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                                    className="hidden"
                                    onChange={(e) => field.onChange(e.target.files)}
                                />
                                {file ? (
                                    <div className="flex items-center gap-3 w-full">
                                        {isImage ? (
                                            <div className="w-10 h-10 rounded-lg border border-blue-100 overflow-hidden shrink-0 bg-white">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-white border border-blue-100 flex items-center justify-center shrink-0">
                                                <FileText size={18} className="text-[#2563eb]" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[#2563eb] truncate">{file.name}</p>
                                            <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                                            <Upload size={16} className="text-slate-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-slate-600">Upload certification</p>
                                            <p className="text-xs text-slate-400 mt-0.5">PDF, PNG, JPG or WEBP · max 10 MB</p>
                                        </div>
                                    </>
                                )}
                            </label>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )
                }}
            />

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-400">This evaluation will be saved to the student&apos;s profile.</p>
                <Button type="submit" className="cursor-pointer gap-1.5 shrink-0">
                    Submit Evaluation
                </Button>
            </div>

        </form>
    )
}

export function ReviewsAndEvaluationTab({ reviews, projectApplicants, employer, projectId, badges }: Props) {
    return (
        <div className="flex rounded-lg overflow-hidden mt-4 min-h-105 bg-white">
            <Tabs defaultValue="student_feedback" orientation="vertical" className="flex w-full">

                {/* Left — tab nav */}
                <TabsList className="flex flex-col items-start w-52 shrink-0 h-auto gap-1 bg-transparent rounded-none p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                        Sections
                    </p>
                    <TabsTrigger
                        value="student_feedback"
                        className="w-full justify-start gap-2 text-sm text-slate-500 rounded-md px-3 py-2
                            hover:bg-slate-100 hover:text-slate-800 transition-colors
                            data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800 data-[state=active]:font-medium
                            data-[state=active]:shadow-none cursor-pointer"
                    >
                        <MessageSquareText size={15} />
                        Student Feedback
                    </TabsTrigger>
                    <TabsTrigger
                        value="evaluate_students"
                        className="w-full justify-start gap-2 text-sm text-slate-500 rounded-md px-3 py-2
                            hover:bg-slate-100 hover:text-slate-800 transition-colors
                            data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800 data-[state=active]:font-medium
                            data-[state=active]:shadow-none cursor-pointer"
                    >
                        <ClipboardList size={15} />
                        Evaluate Students
                    </TabsTrigger>
                </TabsList>

                {/* Vertical separator */}
                <Separator orientation="vertical" className="self-stretch h-auto" />

                {/* Right — content */}
                <div className="flex-1 p-5 overflow-auto">

                    {/* Student Feedback */}
                    <TabsContent value="student_feedback" className="mt-0">
                        {reviews.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-100">
                                    <MessageSquareText size={24} className="text-slate-400" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-semibold text-slate-700">No reviews yet</p>
                                    <p className="text-xs text-slate-400 max-w-xs">
                                        Students will be able to leave feedback once the project is completed.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-semibold text-slate-700">
                                        {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <Star size={14} className="fill-amber-400 text-amber-400" />
                                        <span className="text-sm font-semibold text-slate-700">
                                            {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                                        </span>
                                        <span className="text-xs text-slate-400">average rating</span>
                                    </div>
                                </div>
                                {reviews.map((review) => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Evaluate Students */}
                    <TabsContent value="evaluate_students" className="mt-0">
                        {projectApplicants.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-100">
                                    <UserRound size={24} className="text-slate-400" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-semibold text-slate-700">No students to evaluate</p>
                                    <p className="text-xs text-slate-400 max-w-xs">
                                        There are no team members on this project yet.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <EvaluateStudentsForm projectApplicants={projectApplicants} employer={employer} projectId={projectId} badges={badges} />
                        )}
                    </TabsContent>

                </div>
            </Tabs>
        </div>
    )
}
