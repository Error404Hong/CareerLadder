"use client"

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectLabel } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
}


export default function SummaryForm({ open, onOpenChange }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <form>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Profile Summary</DialogTitle>
                        <DialogDescription>Update your profile summary</DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </form>
        </Dialog>
    )
}