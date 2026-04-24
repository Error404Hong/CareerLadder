"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, MapPin, Users, Wallet } from "lucide-react"
import { useState } from "react"
import { JobDrawer } from "./JobDrawer"

export type Jobs = {
    id: string
    company_id: string
    title: string
    description: string
    requirements: string
    skills_required: string[]
    employment_type: string
    salary_min: number
    salary_max: number
    location: string
    is_remote: boolean
    vacancies: number
    status: string
    created_at: string
    updated_at: string
    company_name: string
    company_website: string
    company_email: string
    company_logo_url: string
}

type Props = {
    job: Jobs
    aiPick?: boolean
}

export function JobCard({ job, aiPick }: Props) {
    const [openDrawer, setOpenDrawer] = useState<boolean>(false);

    return (
        <>
            <Card className="rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 overflow-hidden flex flex-col">
                <CardContent className="p-0 flex flex-col flex-1">
                    <div className="h-1 w-full bg-linear-to-r from-[#0f172a] to-[#2563eb]" />
                    <div className="p-5 flex flex-col flex-1">

                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                <Briefcase size={16} className="text-slate-400" />
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                <Badge className={`text-[11px] rounded-full px-2.5 py-1 shrink-0 ${job.status === "open" ? "bg-green-100 text-green-700 border border-green-100" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                                    {job.status.toUpperCase()}
                                </Badge>
                                {job.is_remote && (
                                    <Badge className="text-[11px] bg-blue-100 text-blue-700 border border-blue-100 rounded-full px-2.5 py-1 shrink-0">
                                        REMOTE
                                    </Badge>
                                )}
                                {aiPick && (
                                    <Badge className="text-[11px] bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-full px-2.5 py-1 shrink-0">
                                        ✨ AI Pick
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-[#0f172a] text-sm leading-snug mb-1">{job.title}</h3>
                        <p className="text-sm text-[#2563eb] mb-3">{job.company_name}</p>

                        {/* Description */}
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4 min-h-8">{job.description}</p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5 mb-4 min-h-6">
                            {job.skills_required?.slice(0, 3).map((skill) => (
                                <span key={skill} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                    {skill}
                                </span>
                            ))}
                            {job.skills_required?.length > 3 && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                                    +{job.skills_required.length - 3} more
                                </span>
                            )}
                        </div>

                        {/* Meta */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <MapPin size={11} className="shrink-0" />
                                <span className="truncate">{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Users size={11} className="shrink-0" />
                                <span>{job.vacancies} {job.vacancies === 1 ? "vacancy" : "vacancies"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 col-span-2">
                                <Wallet size={11} className="shrink-0" />
                                <span>RM {job.salary_min.toLocaleString()} — RM {job.salary_max.toLocaleString()} / month</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Briefcase size={11} className="shrink-0" />
                                <span className="capitalize">{job.employment_type}</span>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-auto">
                            <Button
                                className="w-full text-sm cursor-pointer rounded-xl"
                                onClick={() => setOpenDrawer(true)}
                            >
                                View Job
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <JobDrawer open={openDrawer} onOpenChange={setOpenDrawer} job={job} />
        </>
    )
}