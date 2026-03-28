"use client"

import { useUser } from "@clerk/nextjs"
import Image from "next/image"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Calendar, Clock, Users, Globe, Lock } from "lucide-react"
import type { Training } from "./TrainingCard"
import { Separator } from "@/components/ui/separator"

import { useState } from "react"
import { registerTraining } from "@/app/api/training"


type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    training: Training | null
}

const isDeadlineSoon = (deadline: string) => {
    const diff = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return diff <= 3 && diff >= 0
}

export function TrainingDrawer({ open, onOpenChange, training }: Props) {
    const { user } = useUser();

    const [openDialog, setOpenDialog] = useState<boolean>(false);

    const handleRegister = async () => {
        const id = user!.id;

        try {
            const registerRes = await registerTraining(id, training!.id);

            if (registerRes.success) {
                if (registerRes.message === "You have already registered for this training") {
                    toast.error("You have already registered for this training")
                    setOpenDialog(false);
                    return
                }

                toast.success("You have successfully registered into the training programs");
                setOpenDialog(false);
            } else {
                toast.error("Failed to register into training program.");
                setOpenDialog(false);
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again");
            throw error;
        }
    }

    return (
        <>
            <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="h-full min-w-[40%] ml-auto rounded-none flex flex-col">

                    {/* Header */}
                    <DrawerHeader className="border-b border-slate-300 px-6 py-5 space-y-0">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-col gap-4">
                                <div>
                                    <Image
                                        src={training!.company_logo_url}
                                        width={150}
                                        height={100}
                                        alt="Company Logo"
                                    />
                                </div>
                                <div>
                                    <DrawerTitle className="text-xl font-bold text-[#0f172a] leading-snug">
                                        {training?.title}
                                    </DrawerTitle>
                                    <p className="text-sm text-[#2563eb]  mt-0.5">{training?.company_name}</p>
                                </div>
                            </div>
                            <div className="flex items-end gap-1.5 shrink-0">
                                <Badge className={`text-[11px]  rounded-full px-3 py-1.5 ${training?.status === "open" ? "bg-green-100 text-green-700 border border-green-100" : "bg-blue-50 text-blue-600 border border-blue-100"}`}>
                                    {training?.status.toUpperCase()}
                                </Badge>
                                <span className="flex items-center gap-1 text-[11px]  px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                    {training?.is_public ? <Globe size={10} /> : <Lock size={10} />}
                                    {training?.is_public ? "Public" : "Private"}
                                </span>
                            </div>
                        </div>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">

                        {/* Details */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <Calendar size={13} className="text-slate-400" />
                                <p className="text-sm text-[#0f172a]">
                                    {training?.date && new Date(training.date).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })} · {training?.time}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Users size={13} className="text-slate-400" />
                                <p className="text-sm text-[#0f172a]">{training?.vacancies} spots available</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Clock size={13} className="text-slate-400" />
                                <p className="text-sm  text-[#0f172a]">{training?.duration}</p>
                            </div>
                        </div>

                        {/* Deadline */}
                        <div className={`flex items-center justify-between px-4 py-3 rounded-xl ${isDeadlineSoon(training?.application_deadline ?? "") ? "bg-red-50 border border-red-200" : "bg-slate-100 border border-slate-200"}`}>
                            <div className="flex items-center gap-2">
                                <Calendar size={13} className={isDeadlineSoon(training?.application_deadline ?? "") ? "text-red-400" : "text-slate-400"} />
                                <span className={`text-sm  ${isDeadlineSoon(training?.application_deadline ?? "") ? "text-red-500" : "text-slate-500"}`}>
                                    Registration Deadline
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {isDeadlineSoon(training?.application_deadline ?? "") && (
                                    <span className="text-[10px]  bg-red-100 text-red-500 px-2 py-0.5 rounded-full">Closing Soon</span>
                                )}
                                <span className={`text-sm font-semibold ${isDeadlineSoon(training?.application_deadline ?? "") ? "text-red-600" : "text-slate-700"}`}>
                                    {training?.application_deadline && new Date(training.application_deadline).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                            </div>
                        </div>

                        <Separator />

                        {/* Prerequisites */}
                        {training?.prerequisites && (
                            <>
                                <div>
                                    <p className="text-sm font-semibold text-[#0f172a] uppercase tracking-widest mb-3">Prerequisites</p>
                                    <p className="text-sm text-slate-500 leading-relaxed">{training.prerequisites}</p>
                                </div>
                                <Separator />
                            </>
                        )}

                        {/* Expected Outcome */}
                        {training?.expected_outcome && (
                            <>
                                <div>
                                    <p className="text-sm font-semibold text-[#0f172a] uppercase tracking-widest mb-3">Expected Outcome</p>
                                    <p className="text-sm text-slate-500 leading-relaxed">{training.expected_outcome}</p>
                                </div>
                                <Separator />
                            </>
                        )}

                        {/* Description */}
                        <div>
                            <p className="text-sm font-semibold text-[#0f172a] uppercase tracking-widest mb-3">About This Training</p>
                            <p className="text-sm text-slate-500 leading-relaxed">{training?.description}</p>
                        </div>
                    </div>

                    <DrawerFooter className="flex flex-row gap-3 border-t border-slate-300 px-6 py-4">
                        <DrawerClose asChild>
                            <Button size="sm" variant="outline" className="flex-1 cursor-pointer px-4 py-5">Close</Button>
                        </DrawerClose>
                        <Button size="sm" className="flex-1 cursor-pointer px-4 py-5" onClick={() => setOpenDialog(true)}>
                            Register Now
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            <Dialog open={openDialog} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Registration</DialogTitle>
                        <DialogDescription>
                            You are registering for <span className="font-medium text-[#0f172a]">{training?.title}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">Date</span>
                            <span className="text-xs font-medium">
                                {training?.date && new Date(training.date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">Time</span>
                            <span className="text-xs font-medium">{training?.time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">Organizer</span>
                            <span className="text-xs font-medium">{training?.company_id}</span>
                        </div>
                    </div>

                    <p className="text-xs text-slate-500 text-center">
                        The meeting link will be available after registration.
                    </p>

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="outline" size="sm" className="flex-1 cursor-pointer px-4 py-5">Cancel</Button>
                        </DialogClose>
                        <Button size="sm" className="flex-1 cursor-pointer px-4 py-5" onClick={handleRegister}>
                            Confirm Registration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}