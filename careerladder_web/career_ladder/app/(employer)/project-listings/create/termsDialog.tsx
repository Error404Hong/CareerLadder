"use client"

import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Zap, Award, ScrollText } from "lucide-react"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const REWARDS = [
    {
        icon: Zap,
        color: "bg-amber-50 text-amber-500",
        title: "Experience Points (XP)",
        description:
            "Students earn XP based on their performance and contributions throughout the project. XP accumulates across projects and reflects their growth on the platform.",
    },
    {
        icon: Award,
        color: "bg-blue-50 text-[#2563eb]",
        title: "Badges",
        description:
            "When completing a project, you choose which badges to award each student — recognising specific strengths like teamwork, technical skill, or communication.",
    },
    {
        icon: ScrollText,
        color: "bg-emerald-50 text-emerald-600",
        title: "Certificate of Completion",
        description:
            "A verifiable certificate is automatically issued to every accepted student once the project is marked complete. It includes the project title, your company name, and a unique verification code.",
    },
]

export function TermsDialog({ open, onOpenChange }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-2xl">

                {/* Header band */}
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold tracking-tight">
                        About the Rewards System
                    </DialogTitle>
                    <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                        When you mark a project as complete, each accepted student automatically receives the following.
                    </p>
                </DialogHeader>

                {/* Reward rows */}
                <div className="px-3 py-2 flex flex-col gap-4">
                    {REWARDS.map(({ icon: Icon, color, title, description }) => (
                        <div key={title} className="flex gap-4">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                                <Icon size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#0f172a]">{title}</p>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-3 pb-3">
                    <div className="border-t border-slate-100 pt-4">
                        <DialogClose asChild>
                            <Button className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white cursor-pointer">
                                Got it
                            </Button>
                        </DialogClose>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}