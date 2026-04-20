"use client"

import { useState } from "react"
import { AlertTriangle, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { createNotification } from "@/app/api/notifications"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface DeleteReviewDialogProps {
    reviewId: string | null
    reviewerName: string
    studentId: string
    targetName: string
    onClose: () => void
    onDeleted: (id: string) => void
    onConfirm: (id: string) => Promise<void>
}

export function DeleteReviewDialog({ reviewId, reviewerName, studentId, targetName, onClose, onDeleted, onConfirm }: DeleteReviewDialogProps) {
    const [reason, setReason] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!reviewId) return
        setIsDeleting(true)
        try {
            await onConfirm(reviewId)

            await createNotification(
                studentId,
                "review_removed",
                "Your Review Has Been Removed",
                `Your review for "${targetName}" has been removed by an administrator.${reason ? `\n\nReason: ${reason}` : ""}`,
                "review",
                reviewId,
            )

            toast.success("Review removed and student notified")
            onDeleted(reviewId)
            onClose()
        } catch {
            toast.error("Failed to delete review. Please try again.")
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
        <Dialog open={!!reviewId} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                            <AlertTriangle size={16} className="text-red-500" />
                        </div>
                        <DialogTitle className="text-base font-semibold text-[#0f172a]">Remove Review</DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-slate-500 leading-relaxed">
                        You are about to remove the review by <span className="font-medium text-[#0f172a]">{reviewerName}</span>. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2 py-1">
                    <Label className="text-xs font-medium text-slate-600">
                        Reason <span className="text-slate-400 font-normal">(optional — student will be notified)</span>
                    </Label>
                    <Textarea
                        placeholder="e.g. Fake review, offensive content, spam..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="text-sm resize-none min-h-[80px]"
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
                        {isDeleting ? "Removing..." : "Remove Review"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
