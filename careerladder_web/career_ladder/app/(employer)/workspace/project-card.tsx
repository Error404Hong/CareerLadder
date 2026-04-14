"use client"

import { Project } from "@/types"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Clock } from "lucide-react"

export function ProjectCard({ project }: { project: Project }) {
    const router = useRouter()

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
            {/* Title + status */}
            <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-800 leading-snug">{project.title}</h3>
                {project.status === "completed"
                    ? <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 shrink-0">
                        Completed
                    </span>
                    :
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 shrink-0">
                        In Progress
                    </span>}
            </div>

            {/* Description */}
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{project.description}</p>

            {/* Meta row */}
            <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {project.duration}
                </span>
                <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {project.start_date?.slice(0, 10)} to {project.end_date?.slice(0, 10)}
                </span>
            </div>

            {/* CTA */}
            <Button
                onClick={() => router.push(`/workspace/${project.id}`)}
                className="mt-auto flex items-center justify-center gap-2 w-full h-9 rounded-full text-sm transition-colors cursor-pointer"
            >
                Open Workspace
                <ArrowRight size={14} />
            </Button>
        </div>
    )
}