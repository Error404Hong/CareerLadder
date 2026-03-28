"use client"

import { useState } from "react"
import { RowSelectionState } from "@tanstack/react-table"
import { UserPlus } from "lucide-react"
import { toast } from "sonner"

import { Student } from "@/types"
import { registerTraining } from "@/app/api/training"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

import { InviteDataTable } from "./invite-data-table"
import { getInviteColumns } from "./invite-columns"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    students: Student[]
    isLoadingStudents: boolean
    programId: string
    onSuccess: () => void
}

export function InviteDialog({ open, onOpenChange, students, isLoadingStudents, programId, onSuccess }: Props) {
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const columns = getInviteColumns()
    const selectedCount = Object.keys(rowSelection).length

    const handleOpenChange = (val: boolean) => {
        if (!val) setRowSelection({})
        onOpenChange(val)
    }

    const handleInvite = async () => {
        const selectedIndexes = Object.keys(rowSelection).map(Number)
        const selectedStudents = selectedIndexes.map((i) => students[i])

        setIsSubmitting(true)
        try {
            const results = await Promise.all(
                selectedStudents.map((s) => registerTraining(s.clerk_id, programId))
            )

            const allSuccess = results.every((r) => r.success)
            if (allSuccess) {
                toast.success(`${selectedCount} participant${selectedCount !== 1 ? "s" : ""} added successfully`)
                handleOpenChange(false)
                onSuccess()
            } else {
                toast.error("Some participants could not be added. Please try again.")
            }
        } catch {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Invite Participants</DialogTitle>
                    <DialogDescription>
                        Select students to invite to this training program. You can select multiple participants at once.
                    </DialogDescription>
                </DialogHeader>

                {isLoadingStudents ? (
                    <div className="flex flex-col gap-3 py-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <InviteDataTable
                        columns={columns}
                        data={students}
                        rowSelection={rowSelection}
                        onRowSelectionChange={setRowSelection}
                    />
                )}

                <DialogFooter className="gap-2">
                    <Button variant="outline" className="cursor-pointer" onClick={() => handleOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        className="cursor-pointer gap-1.5"
                        disabled={selectedCount === 0 || isSubmitting}
                        onClick={handleInvite}
                    >
                        <UserPlus size={14} />
                        {isSubmitting ? "Adding..." : `Add ${selectedCount > 0 ? selectedCount : ""} Participant${selectedCount !== 1 ? "s" : ""}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
