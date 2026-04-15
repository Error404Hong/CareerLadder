import { Skeleton } from "@/components/ui/skeleton"

export function CompanyCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="h-1 w-full bg-slate-100" />
            <div className="p-5 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                    <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/3 rounded-full" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                </div>
                <div className="space-y-1.5">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-10" />
                </div>
            </div>
        </div>
    )
}
