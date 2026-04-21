"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { ExternalLink } from "lucide-react"
import { TrainingRegistration, registrationStatusConfig } from "../page"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    training: TrainingRegistration | null
}

const getSessionState = (date?: string): { available: boolean; label: string; tooltipMsg: string } => {
    if (!date) return { available: false, label: "Join Session", tooltipMsg: "Session information not available." }

    const today = new Date()
    const trainingDate = new Date(date)
    const isToday =
        today.getFullYear() === trainingDate.getFullYear() &&
        today.getMonth() === trainingDate.getMonth() &&
        today.getDate() === trainingDate.getDate()

    if (isToday) return { available: true, label: "Join Session", tooltipMsg: "" }

    const isPast = today > trainingDate
    const tooltipMsg = isPast
        ? "This training date has passed."
        : `Available on ${trainingDate.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}.`
    return { available: false, label: "Join Session", tooltipMsg }
}

export function TrainingRegistrationDrawer({ open, onOpenChange, training }: Props) {
    const [sessionState, setSessionState] = useState<{ available: boolean; label: string; tooltipMsg: string }>({ available: false, label: "Join Session", tooltipMsg: "" })

    useEffect(() => {
        const update = () => setSessionState(getSessionState(training?.date))
        const timer = setTimeout(update, 0)
        return () => clearTimeout(timer)
    }, [training?.date])

    const statusCfg = registrationStatusConfig[training?.registration_status ?? ""]

    return (
        <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="h-full min-w-110 ml-auto rounded-none flex flex-col border-0 border-l border-slate-200 bg-white">

                {/* ── Header ── */}
                <DrawerHeader className="p-0 border-0 shrink-0">
                    <div className="px-7 pt-7 pb-6 border-b border-slate-100">
                        {/* Logo + badges */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="h-10 flex items-center">
                                {training?.company_logo_url
                                    ? <Image src={training.company_logo_url} width={100} height={32} alt="Company Logo" className="object-contain object-left" />
                                    : <span className="text-[11px] font-semibold tracking-[0.15em] text-slate-300 uppercase">No Logo</span>
                                }
                            </div>
                            <div className="flex items-center gap-1.5">
                                {statusCfg && (
                                    <span className="text-[10px] font-semibold tracking-[0.14em] uppercase px-2.5 py-1 rounded-sm border border-slate-200 text-slate-500 bg-white">
                                        {statusCfg.label}
                                    </span>
                                )}
                                <span className="text-[10px] font-semibold tracking-[0.14em] uppercase px-2.5 py-1 rounded-sm border border-slate-200 text-slate-500 bg-white">
                                    {training?.is_public ? "Public" : "Private"}
                                </span>
                            </div>
                        </div>
                        {/* Title + company */}
                        <DrawerTitle className="text-[22px] font-bold text-slate-900 leading-tight tracking-tight mb-1">
                            {training?.title}
                        </DrawerTitle>
                        <p className="text-[13px] text-slate-400">{training?.company_name}</p>
                    </div>

                    {/* ── Stats bar ── */}
                    <div className="grid grid-cols-2 border-b border-slate-100">
                        <div className="px-7 py-4 border-r border-slate-100">
                            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-1">Date</p>
                            <p className="text-[13px] font-medium text-slate-800">
                                {training?.date ? new Date(training.date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                            </p>
                        </div>
                        <div className="px-7 py-4">
                            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-1">Time</p>
                            <p className="text-[13px] font-medium text-slate-800">{training?.time ?? "—"}</p>
                        </div>
                        <div className="px-7 py-4 border-t border-r border-slate-100">
                            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-1">Duration</p>
                            <p className="text-[13px] font-medium text-slate-800">{training?.duration ?? "—"}</p>
                        </div>
                        <div className="px-7 py-4 border-t border-slate-100">
                            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-1">Session Link</p>
                            {!training?.meeting_url ? (
                                <p className="text-[13px] text-slate-300">Not provided</p>
                            ) : !sessionState.available ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="flex items-center gap-1 text-[13px] font-medium text-slate-300 cursor-not-allowed select-none">
                                            Join Meeting <ExternalLink size={11} className="opacity-40" />
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>{sessionState.tooltipMsg}</TooltipContent>
                                </Tooltip>
                            ) : (
                                <a href={training.meeting_url} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1 text-[13px] font-medium text-slate-700 hover:text-slate-900 no-underline">
                                    Join Meeting <ExternalLink size={11} className="opacity-60" />
                                </a>
                            )}
                        </div>
                    </div>
                </DrawerHeader>

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto">

                    {training?.prerequisites && (
                        <div className="px-7 py-5 border-b border-slate-100">
                            <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-400 mb-3">Prerequisites</p>
                            <p className="text-[13px] text-slate-500 leading-[1.75]">{training.prerequisites}</p>
                        </div>
                    )}

                    {training?.description && (
                        <div className="px-7 py-5 border-b border-slate-100">
                            <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-400 mb-3">About This Training</p>
                            <p className="text-[13px] text-slate-500 leading-[1.75]">{training.description}</p>
                        </div>
                    )}

                    {training?.expected_outcome && (
                        <div className="px-7 py-5">
                            <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-400 mb-3">Expected Outcome</p>
                            <p className="text-[13px] text-slate-500 leading-[1.75]">{training.expected_outcome}</p>
                        </div>
                    )}

                </div>

                {/* ── Footer ── */}
                <DrawerFooter className="bg-white border-t border-slate-100 px-7 py-4 flex flex-row gap-2">
                    <DrawerClose asChild>
                        <Button size="sm" variant="outline" className="flex-1 h-10 rounded-sm text-[13px] font-medium text-slate-500 border-slate-200 hover:bg-slate-50 cursor-pointer">
                            Close
                        </Button>
                    </DrawerClose>

                    {!sessionState.available ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="flex-1">
                                    <Button size="sm" disabled className="w-full h-10 rounded-sm text-[13px] font-semibold bg-slate-900 text-white opacity-40 cursor-not-allowed">
                                        {sessionState.label}
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>{sessionState.tooltipMsg}</TooltipContent>
                        </Tooltip>
                    ) : (
                        <Button size="sm" className="flex-1 h-10 rounded-sm text-[13px] font-semibold bg-slate-900 hover:bg-slate-800 text-white"
                            onClick={() => window.open(training?.meeting_url, "_blank")}>
                            {sessionState.label}
                        </Button>
                    )}
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
