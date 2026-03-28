"use client"

import { Student } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"

export const getInviteColumns = (): ColumnDef<Student>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
    },
    {
        id: "participant",
        header: () => <span className="text-sm font-medium text-left block">Student</span>,
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 bg-slate-100">
                    {row.original.profileImage ? (
                        <Image src={row.original.profileImage} alt={row.original.firstName} width={32} height={32} className="object-cover h-full w-full" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs font-semibold text-slate-400">
                            {row.original.firstName?.[0]}{row.original.lastName?.[0]}
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-sm font-medium text-[#0f172a]">{row.original.firstName} {row.original.lastName}</p>
                    <p className="text-xs text-slate-400">{row.original.email}</p>
                </div>
            </div>
        )
    },
    {
        accessorKey: "major",
        header: () => <span className="text-sm font-medium text-left block">Major</span>,
        cell: ({ row }) => (
            <span className="text-sm text-slate-500">{row.getValue("major") || "—"}</span>
        )
    },
    {
        accessorKey: "work_status",
        header: () => <span className="text-sm font-medium text-left block">Work Status</span>,
        cell: ({ row }) => {
            const isAvailable = row.getValue("work_status") as boolean
            return (
                <span className={`inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full ${isAvailable ? "bg-green-100 text-green-700 border border-green-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                    {isAvailable ? "Available" : "Unavailable"}
                </span>
            )
        }
    },
]
