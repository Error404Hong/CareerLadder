"use client"

import { Project } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock, Banknote, Wrench } from "lucide-react"

interface ProjectOverviewProps {
    project: Project
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
    return (
        <Card className="mt-2 p-6 rounded-sm border-none shadow-none">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="font-semibold text-lg">Project Overview</CardTitle>
                <CardDescription>
                    A high-level overview of the project purpose, scope, and key information.
                </CardDescription>
            </CardHeader>

            <Separator />

            <CardContent className="px-0 pt-6 flex flex-col gap-6">
                {/* Title */}
                <h2 className="text-xl font-bold text-slate-800">{project.title}</h2>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                    <p className="text-sm font-medium text-slate-500">Description</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{project.description}</p>
                </div>

                {/* Key Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1 bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium uppercase">Duration</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">{project.duration}</p>
                    </div>

                    <div className="flex flex-col gap-1 bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <Banknote className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium uppercase">Allowance</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">RM {project.allowance} / month</p>
                    </div>

                    <div className="flex flex-col gap-1 bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <CalendarDays className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium uppercase">Start Date</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                            {project.start_date ? new Date(project.start_date).toLocaleDateString("en-CA") : "—"}
                        </p>
                    </div>

                    <div className="flex flex-col gap-1 bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <CalendarDays className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium uppercase">End Date</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                            {project.end_date ? new Date(project.end_date).toLocaleDateString("en-CA") : "—"}
                        </p>
                    </div>
                </div>

                {/* Skills Required */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Wrench className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium uppercase">Skills Required</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {project.skills_required.map(skill => (
                            <Badge key={skill} className="text-xs px-2.5 py-1.5">
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
