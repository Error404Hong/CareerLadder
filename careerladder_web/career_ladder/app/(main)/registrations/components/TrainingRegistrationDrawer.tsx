"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Link2, Globe, Lock } from "lucide-react"
import { TrainingRegistration, registrationStatusConfig } from "../page"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    training: TrainingRegistration | null
}

const isSessionAvailable = (date?: string, time?: string) => {
    if (!date || !time) return false
    const trainingDateTime = new Date(`${new Date(date).toISOString().split("T")[0]}T${time}`)
    const now = new Date()
    const diffMinutes = (trainingDateTime.getTime() - now.getTime()) / (1000 * 60)
    return diffMinutes <= 15
}

const getButtonLabel = (date?: string, time?: string) => {
    if (!date || !time) return "Join Session"
    const trainingDateTime = new Date(`${new Date(date).toISOString().split("T")[0]}T${time}`)
    const diffMinutes = (trainingDateTime.getTime() - new Date().getTime()) / (1000 * 60)
    if (diffMinutes <= 0) return "Join Session"
    if (diffMinutes <= 15) return "Session Starting Soon"
    return "Join Session"
}

export function TrainingRegistrationDrawer({ open, onOpenChange, training }: Props) {
    return (
        <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="h-full min-w-[40%] ml-auto rounded-none flex flex-col">
                <DrawerHeader className="border-b border-slate-300 px-6 py-5 space-y-0">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                            <div>
                                {training?.company_logo_url && <Image src={training.company_logo_url} width={150} height={100} alt="Company Logo" />}
                            </div>
                            <div className="flex items-end gap-1.5 shrink-0">
                                <span className={`text-[11px] px-3 py-1.5 rounded-full ${registrationStatusConfig[training?.registration_status ?? ""]?.className ?? "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                                    {registrationStatusConfig[training?.registration_status ?? ""]?.label ?? training?.registration_status}
                                </span>
                                <span className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                    {training?.is_public ? <Globe size={10} /> : <Lock size={10} />}
                                    {training?.is_public ? "Public" : "Private"}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <DrawerTitle className="text-xl font-bold text-[#0f172a] leading-snug">{training?.title}</DrawerTitle>
                            <p className="text-sm text-[#2563eb]">{training?.company_name}</p>
                        </div>
                    </div>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <Calendar size={13} className="text-slate-400" />
                            <p className="text-sm text-[#0f172a]">
                                {training?.date && new Date(training.date).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })} · {training?.time}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Clock size={13} className="text-slate-400" />
                            <p className="text-sm text-[#0f172a]">{training?.duration}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link2 size={13} className="text-slate-400" />
                            {training?.meeting_url ? (
                                <a href={training.meeting_url} target="_blank" rel="noreferrer" className="text-sm text-[#2563eb] hover:underline">
                                    Join Meeting
                                </a>
                            ) : (
                                <p className="text-sm text-slate-400">Not provided</p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {training?.prerequisites && (
                        <div>
                            <p className="text-sm font-semibold text-[#0f172a] uppercase tracking-widest mb-3">Prerequisites</p>
                            <p className="text-sm text-slate-500 leading-relaxed">{training.prerequisites}</p>
                        </div>
                    )}

                    {training?.description && (
                        <div>
                            <p className="text-sm font-semibold text-[#0f172a] uppercase tracking-widest mb-3">About This Training</p>
                            <p className="text-sm text-slate-500 leading-relaxed">{training.description}</p>
                        </div>
                    )}

                    {training?.expected_outcome && (
                        <div>
                            <p className="text-sm font-semibold text-[#0f172a] uppercase tracking-widest mb-3">Expected Outcome</p>
                            <p className="text-sm text-slate-500 leading-relaxed">{training.expected_outcome}</p>
                        </div>
                    )}
                </div>

                <DrawerFooter className="flex flex-row gap-3 border-t border-slate-300 px-6 py-4">
                    <DrawerClose asChild>
                        <Button size="sm" variant="outline" className="flex-1 cursor-pointer px-4 py-5">Close</Button>
                    </DrawerClose>
                    <Button
                        size="sm"
                        className="flex-1 cursor-pointer px-4 py-5 bg-[#0f172a] hover:bg-[#1e293b]"
                        disabled={!isSessionAvailable(training?.date, training?.time)}
                        onClick={() => window.open(training?.meeting_url, "_blank")}
                    >
                        {getButtonLabel(training?.date, training?.time)}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}