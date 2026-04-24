"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, Users, BookOpen, Lock, Globe } from "lucide-react"

import { useState } from "react"
import { TrainingDrawer } from "./TrainingDrawer"

export type Training = {
    id: string
    company_id: string
    title: string
    description: string
    prerequisites: string
    expected_outcome: string
    location: string
    date: string
    time: string
    duration: string
    vacancies: number
    meeting_url: string
    is_public: boolean
    application_deadline: string
    status: string
    created_at: string
    updated_at: string
    company_name: string
    company_email: string
    company_logo_url: string
    website: string
}

type Props = {
    training: Training
    aiPick?: boolean
}

const isDeadlineSoon = (deadline: string) => {
    const diff = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return diff <= 3 && diff >= 0
}

export function TrainingCard({ training, aiPick }: Props) {
    const deadlineSoon = isDeadlineSoon(training.application_deadline)

    const [openDrawer, setOpenDrawer] = useState<boolean>(false);

    const viewProgram = () => {
        setOpenDrawer(true);
    }


    return (
        <>

            <Card className="rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 overflow-hidden flex flex-col">
                <CardContent className="p-0 flex flex-col flex-1">
                    <div className="h-1 w-full bg-linear-to-r from-[#0f172a] to-[#2563eb]" />
                    <div className="p-5 flex flex-col flex-1">

                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                <BookOpen size={16} className="text-slate-400" />
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                <Badge className={`text-[11px] rounded-full px-2.5 py-1 shrink-0 ${training.status === "open" ? "bg-green-100 text-green-700 border border-green-100" : "bg-blue-100 text-blue-700 border border-blue-100"}`}>
                                    {training.status.toUpperCase()}
                                </Badge>
                                <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                    {training.is_public ? <Globe size={10} /> : <Lock size={10} />}
                                    {training.is_public ? "Public" : "Private"}
                                </span>
                                {aiPick && (
                                    <Badge className="text-[11px] bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-full px-2.5 py-1 shrink-0">
                                        ✨ AI Pick
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-[#0f172a] text-sm leading-snug mb-1">{training.title}</h3>
                        <p className="text-sm text-[#2563eb]  mb-3">{training.company_name}</p>

                        {/* Description */}
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4 min-h-8">{training.description}</p>

                        {/* Meta */}
                        <div className="flex flex-col gap-2 mb-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Calendar size={11} className="shrink-0" />
                                <span>{new Date(training.date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Clock size={11} className="shrink-0" />
                                <span>{training.time}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Users size={11} className="shrink-0" />
                                <span>{training.vacancies} spots available</span>
                            </div>
                        </div>

                        {/* Deadline */}
                        <div className={`flex items-center justify-between px-3 py-2 rounded-xl mb-4 ${deadlineSoon ? "bg-red-50 border border-red-200" : "bg-slate-100 border border-slate-200"}`}>
                            <div className="flex items-center gap-2">
                                <Calendar size={12} className={deadlineSoon ? "text-red-400 shrink-0" : "text-slate-400 shrink-0"} />
                                <span className={`text-xs  ${deadlineSoon ? "text-red-500" : "text-slate-500"}`}>
                                    Registration Deadline
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {deadlineSoon && (
                                    <span className="text-[10px]  bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full">
                                        Closing Soon
                                    </span>
                                )}
                                <span className={`text-xs font-semibold ${deadlineSoon ? "text-red-600" : "text-slate-600"}`}>
                                    {new Date(training.application_deadline).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-auto">
                            <Button className="w-full text-sm cursor-pointer rounded-xl"
                                onClick={() => viewProgram()}
                            >
                                View Details
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <TrainingDrawer open={openDrawer} onOpenChange={setOpenDrawer} training={training} />
        </>
    )
}