"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function MeetingCardSkeleton() {
    return (
        <Card className="rounded-lg border border-slate-200 shadow-sm">
            <CardContent className="px-5 py-4 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-40 rounded" />
                        <Skeleton className="h-3 w-24 rounded" />
                    </div>
                    <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="w-7 h-7 rounded-full" />
                    <div className="flex flex-col gap-1">
                        <Skeleton className="h-3 w-24 rounded" />
                        <Skeleton className="h-3 w-32 rounded" />
                    </div>
                </div>
                <div className="flex gap-4">
                    <Skeleton className="h-3 w-24 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1 rounded" />
                    <Skeleton className="h-8 flex-1 rounded" />
                </div>
            </CardContent>
        </Card>
    )
}