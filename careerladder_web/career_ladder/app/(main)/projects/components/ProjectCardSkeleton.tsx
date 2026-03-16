import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProjectCardSkeleton() {
    return (
        <Card className="rounded-2xl border border-slate-100 overflow-hidden">
            <CardContent className="p-0">
                <Skeleton className="h-1 w-full" />
                <div className="p-5 flex flex-col gap-3">
                    <div className="flex justify-between">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <Skeleton className="w-16 h-5 rounded-full" />
                    </div>
                    <Skeleton className="w-3/4 h-4 rounded" />
                    <Skeleton className="w-1/3 h-3 rounded" />
                    <Skeleton className="w-full h-8 rounded" />
                    <div className="flex gap-1.5">
                        <Skeleton className="w-16 h-5 rounded-full" />
                        <Skeleton className="w-16 h-5 rounded-full" />
                        <Skeleton className="w-16 h-5 rounded-full" />
                    </div>
                    <Skeleton className="w-full h-9 rounded-xl" />
                </div>
            </CardContent>
        </Card>
    )
}