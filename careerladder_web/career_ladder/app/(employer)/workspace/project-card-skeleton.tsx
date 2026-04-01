"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function ProjectCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-4 mt-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex gap-2 mt-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-9 w-full rounded-xl mt-1" />
        </div>
    )
}