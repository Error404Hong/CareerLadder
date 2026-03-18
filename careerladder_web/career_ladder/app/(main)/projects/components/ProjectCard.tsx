"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, Calendar, Clock, Users, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectDrawer } from "./ProjectDrawer"

export type Project = {
    id: string
    company_id: string
    title: string
    description: string
    skills_required: string[]
    duration: string
    allowance: number
    vacancies: number
    status: string
    start_date: string
    end_date: string
    created_at: string
    updated_at: string
}

export function ProjectCard({ project }: { project: Project }) {
    const [openDrawer, setOpenDrawer] = useState<boolean>(false);

    const viewProject = () => {
        setOpenDrawer(true);
    }

    return (
        <>
            <Card className="group rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 overflow-hidden flex flex-col">
                <CardContent className="p-0 flex flex-col flex-1">
                    <div className="h-1 w-full bg-linear-to-r from-[#0f172a] to-[#2563eb]" />
                    <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                <Briefcase size={16} className="text-slate-400" />
                            </div>
                            <Badge className="text-[11px]  bg-green-50 text-green-600 border border-green-100 rounded-full px-2.5 py-0.5 shrink-0">
                                {project.status.toUpperCase()}
                            </Badge>
                        </div>
                        <h3 className="font-bold text-[#0f172a] text-sm leading-snug mb-1">{project.title}</h3>
                        <p className="text-sm text-[#2563eb]  mb-3">{project.company_id}</p>
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4 min-h-10">{project.description}</p>
                        <div className="flex flex-wrap gap-1.5 mb-4 min-h-6">
                            {project.skills_required?.slice(0, 3).map((skill) => (
                                <span key={skill} className="text-[11px]  px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                    {skill}
                                </span>
                            ))}
                            {project.skills_required?.length > 3 && (
                                <span className="text-[11px]  px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                                    +{project.skills_required.length - 3} more
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Clock size={11} className="shrink-0" />
                                <span>{project.duration}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Users size={11} className="shrink-0" />
                                <span>{project.vacancies} vacancies</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Wallet size={11} className="shrink-0" />
                                <span>RM {project.allowance}/mo</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Calendar size={11} className="shrink-0" />
                                <span>{new Date(project.start_date).toLocaleDateString("en-MY", { month: "short", year: "numeric" })}</span>
                            </div>
                        </div>
                        <div className="mt-auto">
                            <Button className="w-full text-sm py-2.5 rounded-lg cursor-pointer"
                                onClick={() => viewProject()}
                            >
                                View Project
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ProjectDrawer open={openDrawer} onOpenChange={setOpenDrawer} project={project} />
        </>


    )
}