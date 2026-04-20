"use client"

import { useState } from "react"
import { Training } from "@/types"
import { deleteProgramById } from "@/app/api/training"
import { createNotification } from "@/app/api/notifications"
import { toast } from "sonner"
import { Trash2, AlertTriangle } from "lucide-react"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface DeleteProgramDialogProps {
    program: Training | null
    onClose: () => void
    onDeleted: (id: string) => void
}

export function DeleteProgramDialog({ program, onClose, onDeleted }: DeleteProgramDialogProps) {
    const [reason, setReason] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!program) return
        setIsDeleting(true)
        try {
            const res = await deleteProgramById(program.id)
            if (!res.success) {
                toast.error("Failed to delete training program")
                return
            }

            await createNotification(
                program.company_id,
                "program_deleted",
                "Training Program Removed",
                `Your training program "${program.title}" has been removed by an administrator.${reason ? `\n\nReason: ${reason}` : ""}`,
                "training",
                program.id,
            )

            toast.success("Training program deleted and company notified")
            onDeleted(program.id)
            onClose()
        } catch {
            toast.error("Something went wrong. Please try again")
        } finally {
            setIsDeleting(false)
        }
    }

    const handleOpenChange = (open: boolean) => {
        if (!open && !isDeleting) {
            setReason("")
            onClose()
        }
    }

    return (
        <Dialog open={!!program} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                            <AlertTriangle size={16} className="text-red-500" />
                        </div>
                        <DialogTitle className="text-base font-semibold text-[#0f172a]">Delete Training Program</DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-slate-500 leading-relaxed">
                        You are about to permanently delete <span className="font-medium text-[#0f172a]">&quot;{program?.title}&quot;</span>. The company will be notified with your reason.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2 py-1">
                    <Label className="text-xs font-medium text-slate-600">
                        Reason <span className="text-slate-400 font-normal">(optional)</span>
                    </Label>
                    <Textarea
                        placeholder="e.g. Violates platform policies, misleading content..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="text-sm resize-none min-h-[90px]"
                        disabled={isDeleting}
                    />
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isDeleting} className="cursor-pointer">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="cursor-pointer bg-red-500 hover:bg-red-600 text-white gap-1.5"
                    >
                        <Trash2 size={14} />
                        {isDeleting ? "Deleting..." : "Delete & Notify"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
