import { Skeleton } from "@/components/ui/skeleton"

export function JobCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3">
            <div className="flex justify-between">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="w-20 h-5 rounded-full" />
            </div>
            <Skeleton className="w-2/3 h-4 rounded" />
            <Skeleton className="w-1/3 h-3 rounded" />
            <Skeleton className="w-full h-8 rounded" />
            <div className="flex gap-2">
                <Skeleton className="w-16 h-5 rounded-full" />
                <Skeleton className="w-16 h-5 rounded-full" />
            </div>
            <Skeleton className="w-full h-9 rounded-xl mt-auto" />
        </div>
    )
}