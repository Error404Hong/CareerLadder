"use client"

import { Button } from "@/components/ui/button"
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
}

export function JobCard({ job }: Props) {
    const [openDrawer, setOpenDrawer] = useState<boolean>(false);

    const viewJobDetails = () => {
        console.log("Viewing Details for Job: ", job.id + "," + job.title)
        setOpenDrawer(true);
    }


    return (
        <>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 p-6 flex flex-col">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div>
                            <h3 className="font-bold text-lg leading-snug">{job.title}</h3>
                            <p className="text-sm text-[#2563eb]  mt-0.5">{job.company_name}</p>
                        </div>
                    </div>
                    <div className="flex items-end gap-1.5 shrink-0">
                        <span className="text-[12px]  px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-100">
                            {job.status.toUpperCase()}
                        </span>
                        {job.is_remote && (
                            <span className="text-[12px]  px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-100">
                                REMOTE
                            </span>
                        )}
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-4 min-h-8">{job.description}</p>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin size={12} className="shrink-0" />
                        <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Users size={12} className="shrink-0" />
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

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-4 min-h-6">
                    {job.skills_required?.slice(0, 3).map((skill) => (
                        <span key={skill} className="text-[11px]  px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                            {skill}
                        </span>
                    ))}
                    {job.skills_required?.length > 3 && (
                        <span className="text-[11px]  px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                            +{job.skills_required.length - 3} more
                        </span>
                    )}
                </div>

                {/* CTA */}
                <div className="mt-auto">
                    <Button
                        className="w-full text-sm cursor-pointer rounded-2xl"
                        onClick={() => viewJobDetails()}
                    >
                        View Job
                    </Button>
                </div>
            </div>

            <JobDrawer open={openDrawer} onOpenChange={setOpenDrawer} job={job} />
        </>
    )
}