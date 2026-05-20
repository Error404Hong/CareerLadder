"use client"

import { useUser } from "@clerk/nextjs"
import Image from "next/image"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Calendar } from "lucide-react"
import type { Training } from "./TrainingCard"

import { useState } from "react"
import { registerTraining } from "@/app/api/training"
import { createNotification } from "@/app/api/notifications"
import Link from "next/link"


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
            console.log("Registering for training: ", training);

            const sendConfirmationToUser = await createNotification(
                id,
                "training_registered",
                "Training Registration Confirmed",
                `You have successfully registered for training program - ${training?.title}`,
                "training",
                training!.id
            )

            const notifyCompany = await createNotification(
                training!.company_id,
                "training_registered",
                "New Training Registration",
                `A student has registered for your training program: ${training?.title}`,
                "training",
                training!.id
            )

            const registerRes = await registerTraining(id, training!.id);


            if (registerRes.success && notifyCompany.success && sendConfirmationToUser.success) {
                if (registerRes.message === "You have already registered for this training") {
                    toast.error("You have already registered for this training")
                    setOpenDialog(false);
                    return
                }
                toast.success("You have successfully registered into the training programs");
                setOpenDialog(false)
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
                <DrawerContent className="h-full min-w-110 ml-auto rounded-none flex flex-col border-0 border-l border-slate-200 bg-white">

                    {/* ── Header ── */}
                    <DrawerHeader className="p-0 border-0 shrink-0">
                        <div className="px-7 pt-7 pb-6 border-b border-slate-100">
                            {/* Logo + badges */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="h-10 flex items-center">
                                    {training?.company_logo_url
                                        ? <Image src={training.company_logo_url} width={100} height={32} alt="Company Logo" className="object-contain object-left  w-15" />
                                        : <span className="text-[11px] font-semibold tracking-[0.15em] text-slate-300 uppercase">No Logo</span>
                                    }
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-semibold tracking-[0.14em] uppercase px-2.5 py-1 rounded-sm border border-slate-200 text-slate-500 bg-white">
                                        {training?.status}
                                    </span>
                                    <span className="text-[10px] font-semibold tracking-[0.14em] uppercase px-2.5 py-1 rounded-sm border border-slate-200 text-slate-500 bg-white">
                                        {training?.is_public ? "Public" : "Private"}
                                    </span>
                                </div>
                            </div>
                            {/* Title + company */}
                            <DrawerTitle className="text-[22px] font-bold text-slate-900 leading-tight tracking-tight mb-1">
                                {training?.title}
                            </DrawerTitle>
                            <Link href={`/companies/${training?.company_id}`}>
                                <p className="text-[13px] text-slate-400 hover:text-slate-600 transition-colors">{training?.company_name}</p>
                            </Link>
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
                                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-1">Spots</p>
                                <p className="text-[13px] font-medium text-slate-800">{training?.vacancies ?? "—"} available</p>
                            </div>
                        </div>
                    </DrawerHeader>

                    {/* ── Body ── */}
                    <div className="flex-1 overflow-y-auto">

                        {/* Deadline */}
                        {training?.application_deadline && (
                            <div className={`mx-7 mt-5 mb-1 flex items-center justify-between px-4 py-3 rounded-sm border ${isDeadlineSoon(training.application_deadline) ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
                                <div className="flex items-center gap-2">
                                    <Calendar size={12} className={isDeadlineSoon(training.application_deadline) ? "text-red-400" : "text-slate-400"} />
                                    <span className={`text-[12px] font-medium ${isDeadlineSoon(training.application_deadline) ? "text-red-500" : "text-slate-500"}`}>
                                        Registration Deadline
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isDeadlineSoon(training.application_deadline) && (
                                        <span className="text-[10px] font-semibold bg-red-100 text-red-500 px-2 py-0.5 rounded-sm">Closing Soon</span>
                                    )}
                                    <span className={`text-[12px] font-semibold ${isDeadlineSoon(training.application_deadline) ? "text-red-600" : "text-slate-700"}`}>
                                        {new Date(training.application_deadline).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                </div>
                            </div>
                        )}

                        {training?.prerequisites && (
                            <div className="px-7 py-5 border-b border-slate-100">
                                <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-400 mb-3">Prerequisites</p>
                                <p className="text-[13px] text-slate-500 leading-[1.75]">{training.prerequisites}</p>
                            </div>
                        )}

                        {training?.expected_outcome && (
                            <div className="px-7 py-5 border-b border-slate-100">
                                <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-400 mb-3">Expected Outcome</p>
                                <p className="text-[13px] text-slate-500 leading-[1.75]">{training.expected_outcome}</p>
                            </div>
                        )}

                        {training?.description && (
                            <div className="px-7 py-5">
                                <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-400 mb-3">About This Training</p>
                                <p className="text-[13px] text-slate-500 leading-[1.75]">{training.description}</p>
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
                        <Button size="sm" className="flex-1 h-10 rounded-sm text-[13px] font-semibold cursor-pointer bg-slate-900 hover:bg-slate-800 text-white" onClick={() => setOpenDialog(true)}>
                            Register Now
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
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
                            <span className="text-xs font-medium">{training?.company_name}</span>
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