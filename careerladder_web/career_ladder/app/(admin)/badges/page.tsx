"use client"

import { Badge } from "@/types"
import { getBadges, addBadge, updateBadge, deleteBadge } from "@/app/api/rewards"
import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldError } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Plus, Pencil, Trash2, Award, AlertTriangle, Users, Lightbulb, Code2, MessageSquare, Zap, GitCommit } from "lucide-react"

const ICON_OPTIONS = [
    { name: "Award", component: Award },
    { name: "Users", component: Users },
    { name: "Lightbulb", component: Lightbulb },
    { name: "Code2", component: Code2 },
    { name: "MessageSquare", component: MessageSquare },
    { name: "Zap", component: Zap },
    { name: "GitCommit", component: GitCommit },
] as const

function BadgeIcon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
    const match = ICON_OPTIONS.find(i => i.name === name)
    const Icon = match?.component ?? Award
    return <Icon size={size} className={className} />
}

const badgeFormSchema = z.object({
    name: z.string().min(1, "Badge name is required"),
    description: z.string().min(1, "Description is required"),
    icon: z.string().min(1, "Please select an icon"),
})
type BadgeFormValues = z.infer<typeof badgeFormSchema>

export default function BadgeManagement() {
    const [isLoading, setIsLoading] = useState(true)
    const [badgeList, setBadgeList] = useState<Badge[]>([])
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<Badge | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<Badge | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const form = useForm<BadgeFormValues>({
        resolver: zodResolver(badgeFormSchema),
        defaultValues: { name: "", description: "", icon: "Award" },
    })

    useEffect(() => { fetchBadges() }, [])

    const fetchBadges = async () => {
        try {
            const res = await getBadges()
            if (res.success) setBadgeList(res.data ?? [])
            else toast.error("Failed to fetch badges")
        } catch {
            toast.error("Something went wrong. Please try again")
        } finally {
            setIsLoading(false)
        }
    }

    const openAdd = () => {
        setEditing(null)
        form.reset({ name: "", description: "", icon: "Award" })
        setFormOpen(true)
    }

    const openEdit = (badge: Badge) => {
        setEditing(badge)
        form.reset({ name: badge.name, description: badge.description, icon: badge.icon })
        setFormOpen(true)
    }

    const handleSubmit = async (values: BadgeFormValues) => {
        setIsSubmitting(true)
        try {
            if (editing) {
                const res = await updateBadge(editing.id, values.name, values.description, values.icon)
                if (res.success) {
                    setBadgeList(prev => prev.map(b => b.id === editing.id ? res.data : b))
                    toast.success("Badge updated successfully")
                    setFormOpen(false)
                } else {
                    toast.error("Failed to update badge")
                }
            } else {
                const res = await addBadge(values.name, values.description, values.icon)
                if (res.success) {
                    setBadgeList(prev => [res.data, ...prev])
                    toast.success("Badge added successfully")
                    setFormOpen(false)
                } else {
                    toast.error("Failed to add badge")
                }
            }
        } catch {
            toast.error("Something went wrong. Please try again")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setIsDeleting(true)
        try {
            const res = await deleteBadge(deleteTarget.id)
            if (res.success) {
                setBadgeList(prev => prev.filter(b => b.id !== deleteTarget.id))
                toast.success("Badge deleted successfully")
                setDeleteTarget(null)
            } else {
                toast.error("Failed to delete badge")
            }
        } catch {
            toast.error("Something went wrong. Please try again")
        } finally {
            setIsDeleting(false)
        }
    }

    const iconPreview = form.watch("icon")

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin-dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Badge Management</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-[#0f172a]">Badge Management</h1>
                        <p className="text-sm text-slate-400 mt-0.5">Create and manage badges available for employers to award</p>
                    </div>
                    <Button
                        onClick={openAdd}
                        className="flex items-center gap-1.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm cursor-pointer"
                    >
                        <Plus size={14} /> Add Badge
                    </Button>
                </div>

                {/* Stat */}
                {!isLoading && (
                    <div className="flex items-center gap-4 px-5 py-4 bg-white rounded-xl border border-slate-100 shadow-sm w-fit">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <Award size={16} className="text-[#2563eb]" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Total Badges</p>
                            <p className="text-2xl font-bold text-[#0f172a] leading-tight">{badgeList.length}</p>
                        </div>
                    </div>
                )}

                {/* Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-44 rounded-xl" />
                        ))}
                    </div>
                ) : badgeList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <Award size={28} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-medium text-slate-400">No badges yet</p>
                        <p className="text-xs text-slate-300">Click &quot;Add Badge&quot; to create your first one</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {badgeList.map(badge => (
                            <Card key={badge.id} className="rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="px-5">
                                    <div className="flex items-start justify-between">
                                        <div className="w-11 h-11 rounded-xl bg-[#0f172a] flex items-center justify-center shrink-0">
                                            <BadgeIcon name={badge.icon} size={20} className="text-white" />
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => openEdit(badge)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#2563eb] hover:bg-blue-50 transition-colors cursor-pointer"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(badge)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <p className="font-semibold text-[#0f172a] text-sm">{badge.name}</p>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{badge.description}</p>
                                    </div>
                                    <p className="text-[10px] text-slate-300 mt-4">
                                        Created{" "}
                                        {new Date(badge.created_at).toLocaleDateString("en-US", {
                                            year: "numeric", month: "short", day: "numeric",
                                        })}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Add / Edit Dialog */}
            <Dialog open={formOpen} onOpenChange={(open) => { if (!isSubmitting) setFormOpen(open) }}>
                <form id="badge-form" onSubmit={form.handleSubmit(handleSubmit)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editing ? "Edit Badge" : "Add Badge"}</DialogTitle>
                            <DialogDescription className="text-sm text-slate-400">
                                {editing ? "Update the badge details below." : "Fill in the details to create a new badge."}
                            </DialogDescription>
                        </DialogHeader>

                        <FieldGroup className="gap-5">
                            <Controller name="name" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="badge-name">Name</Label>
                                        <Input
                                            {...field}
                                            id="badge-name"
                                            placeholder="e.g. Team Player"
                                            aria-invalid={fieldState.invalid}
                                            disabled={isSubmitting}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller name="description" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label htmlFor="badge-description">Description</Label>
                                        <Textarea
                                            {...field}
                                            id="badge-description"
                                            placeholder="What does this badge represent?"
                                            className="resize-none min-h-20"
                                            aria-invalid={fieldState.invalid}
                                            disabled={isSubmitting}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller name="icon" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Label>Icon</Label>
                                        <div className="flex items-center gap-3">
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                disabled={isSubmitting}
                                            >
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ICON_OPTIONS.map(({ name, component: Icon }) => (
                                                        <SelectItem key={name} value={name}>
                                                            <div className="flex items-center gap-2">
                                                                <Icon size={14} />
                                                                <span>{name}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <div className="w-9 h-9 rounded-lg bg-[#0f172a] flex items-center justify-center shrink-0">
                                                <BadgeIcon name={iconPreview} size={16} className="text-white" />
                                            </div>
                                        </div>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </FieldGroup>

                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button variant="outline" disabled={isSubmitting} className="cursor-pointer">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                form="badge-form"
                                disabled={isSubmitting}
                                className="bg-[#0f172a] hover:bg-[#1e293b] text-white cursor-pointer"
                            >
                                {isSubmitting ? "Saving..." : editing ? "Save Changes" : "Add Badge"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </form>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!isDeleting && !open) setDeleteTarget(null) }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                <AlertTriangle size={16} className="text-red-500" />
                            </div>
                            <DialogTitle className="text-base font-semibold text-[#0f172a]">Delete Badge</DialogTitle>
                        </div>
                        <DialogDescription className="text-sm text-slate-500 leading-relaxed">
                            Are you sure you want to delete{" "}
                            <span className="font-medium text-[#0f172a]">&quot;{deleteTarget?.name}&quot;</span>?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                            disabled={isDeleting}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600 text-white gap-1.5 cursor-pointer"
                        >
                            <Trash2 size={14} />
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}