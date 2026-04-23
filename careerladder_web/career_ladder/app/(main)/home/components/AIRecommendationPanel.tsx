"use client"

import { useRouter } from "next/navigation"
import { Sparkles, RefreshCw, Briefcase, FolderKanban, BookOpen, AlertCircle, UserCircle } from "lucide-react"
import { Job, Project, Training } from "@/types"
import { useRecommendations } from "@/hooks/useRecommendations"
import { Skeleton } from "@/components/ui/skeleton"

type Props = {
    jobs: (Job & { company_name?: string })[]
    projects: (Project & { company_name?: string })[]
    trainings: Training[]
}

export function AIRecommendationPanel({ jobs, projects, trainings }: Props) {
    const router = useRouter()
    const { recommendations, isLoading, error, refresh } = useRecommendations(jobs, projects, trainings)

    const recommendedJobs = jobs.filter(j => recommendations?.recommendedJobIds.includes(j.id))
    const recommendedProjects = projects.filter(p => recommendations?.recommendedProjectIds.includes(p.id))
    const recommendedTrainings = trainings.filter(t => recommendations?.recommendedTrainingIds.includes(t.id))

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-4 pb-3 flex items-center gap-2.5 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0">
                    <Sparkles size={13} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 leading-none">AI Recommendations</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Powered by Gemini</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                        Beta
                    </span>
                    <button
                        onClick={refresh}
                        disabled={isLoading}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-40"
                        title="Refresh recommendations"
                    >
                        <RefreshCw size={12} className={`text-slate-400 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            <div className="p-4 flex flex-col gap-4">

                {/* Loading state */}
                {isLoading && (
                    <div className="flex flex-col gap-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-3/5" />
                        <div className="flex gap-1.5 flex-wrap mt-1">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-5 w-14 rounded-full" />
                            ))}
                        </div>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full rounded-xl" />
                        ))}
                    </div>
                )}

                {/* Error state */}
                {!isLoading && error && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                        <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-red-500">{error}. Try refreshing.</p>
                    </div>
                )}

                {/* Empty — no data yet and not loading */}
                {!isLoading && !error && !recommendations && (
                    <div className="flex flex-col items-center gap-2 py-4 text-center">
                        <UserCircle size={28} className="text-slate-200" />
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Complete your profile to get personalised recommendations.
                        </p>
                        <button
                            onClick={() => router.push("/profile")}
                            className="text-xs text-indigo-500 hover:underline"
                        >
                            Go to Profile →
                        </button>
                    </div>
                )}

                {/* Results */}
                {!isLoading && recommendations && (
                    <>
                        {/* Career Advice */}
                        <div className="flex flex-col gap-1.5">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Career Advice</p>
                            <p className="text-xs text-slate-600 leading-relaxed">{recommendations.careerAdvice}</p>
                        </div>

                        {/* Skill Gaps */}
                        {recommendations.skillGaps.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Skills to Learn</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {recommendations.skillGaps.map(skill => (
                                        <span
                                            key={skill}
                                            className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommended Jobs */}
                        {recommendedJobs.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <Briefcase size={10} /> Recommended Jobs
                                </p>
                                <div className="flex flex-col gap-1.5">
                                    {recommendedJobs.slice(0, 3).map(job => (
                                        <button
                                            key={job.id}
                                            onClick={() => router.push(`/jobs?search=${encodeURIComponent(job.title)}`)}
                                            className="text-left px-3 py-2 rounded-xl border border-blue-100 bg-blue-50 hover:bg-blue-100 hover:border-blue-200 transition-colors"
                                        >
                                            <p className="text-xs font-medium text-slate-700 line-clamp-1">{job.title}</p>
                                            {job.company_name && (
                                                <p className="text-[11px] text-slate-400 mt-0.5">{job.company_name}</p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommended Projects */}
                        {recommendedProjects.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <FolderKanban size={10} /> Recommended Projects
                                </p>
                                <div className="flex flex-col gap-1.5">
                                    {recommendedProjects.slice(0, 3).map(project => (
                                        <button
                                            key={project.id}
                                            onClick={() => router.push(`/projects?search=${encodeURIComponent(project.title)}`)}
                                            className="text-left px-3 py-2 rounded-xl border border-violet-100 bg-violet-50 hover:bg-violet-100 hover:border-violet-200 transition-colors"
                                        >
                                            <p className="text-xs font-medium text-slate-700 line-clamp-1">{project.title}</p>
                                            {project.company_name && (
                                                <p className="text-[11px] text-slate-400 mt-0.5">{project.company_name}</p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommended Training */}
                        {recommendedTrainings.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <BookOpen size={10} /> Recommended Training
                                </p>
                                <div className="flex flex-col gap-1.5">
                                    {recommendedTrainings.slice(0, 3).map(training => (
                                        <button
                                            key={training.id}
                                            onClick={() => router.push(`/training?search=${encodeURIComponent(training.title)}`)}
                                            className="text-left px-3 py-2 rounded-xl border border-green-100 bg-green-50 hover:bg-green-100 hover:border-green-200 transition-colors"
                                        >
                                            <p className="text-xs font-medium text-slate-700 line-clamp-1">{training.title}</p>
                                            {training.date && (
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    {new Date(training.date).toLocaleDateString("en-MY", { month: "short", day: "numeric", year: "numeric" })}
                                                </p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}