"use client"

import { useState } from "react"
import { Snowflake, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { updateUserStatus } from "@/app/api/user"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface FreezeAccountDialogProps {
    open: boolean
    name: string
    clerkId: string
    isFreezing: boolean
    onClose: () => void
    onSuccess: (newStatus: number) => void
}

export function FreezeAccountDialog({ open, name, clerkId, isFreezing, onClose, onSuccess }: FreezeAccountDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const newStatus = isFreezing ? 3 : 1

    const handleConfirm = async () => {
        setIsSubmitting(true)
        try {
            const res = await updateUserStatus(clerkId, newStatus)
            if (res.success) {
                toast.success(isFreezing ? `${name}'s account has been frozen.` : `${name}'s account has been unfrozen.`)
                onSuccess(newStatus)
                onClose()
            } else {
                toast.error("Failed to update account status. Please try again.")
            }
        } catch {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o && !isSubmitting) onClose() }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isFreezing ? "bg-blue-50" : "bg-green-50"}`}>
                            {isFreezing
                                ? <Snowflake size={16} className="text-blue-500" />
                                : <ShieldCheck size={16} className="text-green-500" />
                            }
                        </div>
                        <DialogTitle className="text-base font-semibold text-[#0f172a]">
                            {isFreezing ? "Freeze Account" : "Unfreeze Account"}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-slate-500 leading-relaxed">
                        {isFreezing
                            ? <>You are about to freeze <span className="font-medium text-[#0f172a]">{name}</span>&apos;s account. They will be immediately signed out and unable to log in until unfrozen.</>
                            : <>You are about to unfreeze <span className="font-medium text-[#0f172a]">{name}</span>&apos;s account. They will be able to log in again.</>
                        }
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="cursor-pointer">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className={`cursor-pointer gap-1.5 ${isFreezing ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}
                    >
                        {isFreezing
                            ? <Snowflake size={14} />
                            : <ShieldCheck size={14} />
                        }
                        {isSubmitting
                            ? (isFreezing ? "Freezing..." : "Unfreezing...")
                            : (isFreezing ? "Freeze Account" : "Unfreeze Account")
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
