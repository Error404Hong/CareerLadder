"use client"

import { Application } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Info, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function SuitabilityCell({ score, reasoning }: { score: number; reasoning: string }) {
    const color =
        score >= 80 ? "bg-green-100 text-green-700 border-green-200"
            : score >= 60 ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                : score >= 40 ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                    : "bg-red-100 text-red-600 border-red-200"
    const iconColor =
        score >= 80 ? "text-green-500"
            : score >= 60 ? "text-indigo-400"
                : score >= 40 ? "text-yellow-500"
                    : "text-red-400"

    return (
        <TooltipProvider>
            <Tooltip>
                <Popover>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <button className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer ${color}`}>
                                {score} pts
                                <Info size={11} className={iconColor} />
                            </button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <PopoverContent className="w-64" side="top">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1.5">
                                <Sparkles size={12} className="text-indigo-500 shrink-0" />
                                <span className="text-xs font-semibold text-slate-700">AI Assessment</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">{reasoning}</p>
                        </div>
                    </PopoverContent>
                </Popover>
                <TooltipContent side="top">
                    <p>Click to see AI reasoning</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
    reviewed: { label: "Reviewed", className: "bg-blue-100 text-blue-700 border border-blue-200" },
    shortlisted: { label: "Shortlisted", className: "bg-purple-100 text-purple-700 border border-purple-200" },
    accepted: { label: "Accepted", className: "bg-green-100 text-green-700 border border-green-200" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-600 border border-red-200" },
}

export const getColumns = (
    onView: (application: Application) => void,
    rankingMap?: Map<string, { score: number; reasoning: string }>
): ColumnDef<Application>[] => [
        {
            id: "applicant",
            header: () => <span className="text-sm font-medium text-left block">Applicant</span>,
            cell: ({ row }) => (
                <span className="text-sm font-medium text-[#0f172a]">
                    {row.original.first_name} {row.original.last_name}
                </span>
            )
        },
        {
            accessorKey: "major",
            header: () => <span className="text-sm font-medium text-left block">Major</span>,
            cell: ({ row }) => <span className="text-sm text-slate-500">{row.getValue("major")}</span>
        },
        {
            accessorKey: "applied_at",
            header: ({ column }) => (
                <button
                    className="text-sm font-medium text-left cursor-pointer flex items-center gap-1"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Applied <ArrowUpDown size={12} />
                </button>
            ),
            cell: ({ row }) => (
                <span className="text-sm text-slate-500">
                    {new Date(row.getValue("applied_at")).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                </span>
            )
        },
        {
            accessorKey: "status",
            header: () => <span className="text-sm font-medium text-left block">Status</span>,
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                const config = statusConfig[status] ?? { label: status, className: "bg-slate-100 text-slate-500 border border-slate-200" }
                return (
                    <span className={`inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full ${config.className}`}>
                        {config.label}
                    </span>
                )
            }
        },
        ...(rankingMap
            ? [{
                id: "suitability",
                header: () => <span className="text-sm font-medium text-left block">Suitability</span>,
                cell: ({ row }: { row: { original: Application } }) => {
                    const rank = rankingMap.get(row.original.id)
                    if (!rank) return null
                    return <SuitabilityCell score={rank.score} reasoning={rank.reasoning} />
                }
            }] as ColumnDef<Application>[]
            : []),
        {
            id: "actions",
            header: () => <span className="text-sm font-medium text-left block">Actions</span>,
            cell: ({ row }) => (
                <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer text-xs"
                    onClick={() => onView(row.original)}
                >
                    View
                </Button>
            )
        }
    ]