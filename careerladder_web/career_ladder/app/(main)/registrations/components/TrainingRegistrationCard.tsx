"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, Clock, Globe, Lock } from "lucide-react"
import { TrainingRegistration, registrationStatusConfig } from "../page"

type Props = {
    training: TrainingRegistration
    onView: (t: TrainingRegistration) => void
}

export function TrainingRegistrationCard({ training, onView }: Props) {
    return (
        <Card className="rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 overflow-hidden flex flex-col">
            <CardContent className="p-0 flex flex-col flex-1">
                <div className="h-1 w-full bg-linear-to-r from-[#0f172a] to-[#2563eb]" />
                <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                            <BookOpen size={16} className="text-slate-400" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${registrationStatusConfig[training.registration_status]?.className ?? "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                                {registrationStatusConfig[training.registration_status]?.label ?? training.registration_status}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                {training.is_public ? <Globe size={10} /> : <Lock size={10} />}
                                {training.is_public ? "Public" : "Private"}
                            </span>
                        </div>
                    </div>
                    <h3 className="font-semibold text-[#0f172a] text-sm leading-snug mb-1">{training.title}</h3>
                    <p className="text-sm text-[#2563eb] mb-3">{training.company_name}</p>
                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-4 min-h-8">{training.description}</p>
                    <div className="flex flex-col gap-2 mb-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-400">
                            <Calendar size={11} className="shrink-0" />
                            <span>{new Date(training.date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-400">
                            <Clock size={11} className="shrink-0" />
                            <span>{training.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-400">
                            <Calendar size={11} className="shrink-0" />
                            <span>Registered: {new Date(training.registered_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                    </div>
                    <div className="mt-auto">
                        <Button className="w-full text-sm cursor-pointer rounded-xl" onClick={() => onView(training)}>
                            View Details
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}