import { PieChart, Pie, Cell } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LayoutGrid } from "lucide-react"

const STATUS_COLORS: Record<string, string> = {
    pending: "#6366f1",
    reviewed: "#f59e0b",
    accepted: "#10b981",
    rejected: "#f43f5e",
}

const STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    reviewed: "Reviewed",
    accepted: "Accepted",
    rejected: "Rejected",
}

const chartConfig = {
    pending: { label: "Pending", color: STATUS_COLORS.pending },
    reviewed: { label: "Reviewed", color: STATUS_COLORS.reviewed },
    accepted: { label: "Accepted", color: STATUS_COLORS.accepted },
    rejected: { label: "Rejected", color: STATUS_COLORS.rejected },
}

interface ApplicationStatusCardProps {
    isLoading: boolean
    chartData: { status: string; count: number; fill: string }[]
    total: number
}

export function ApplicationStatusCard({ isLoading, chartData, total }: ApplicationStatusCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700">My Applications</h3>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{total} total</span>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center gap-3">
                    <Skeleton className="h-32 w-32 rounded-full" />
                    <div className="w-full space-y-2">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-3 w-full" />)}
                    </div>
                </div>
            ) : total === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6">
                    <LayoutGrid size={24} className="text-slate-200" />
                    <p className="text-xs text-slate-400 text-center">No applications yet.<br />Start applying to track your progress.</p>
                </div>
            ) : (
                <>
                    <ChartContainer config={chartConfig} className="h-36 w-full">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                            <Pie
                                data={chartData}
                                dataKey="count"
                                nameKey="status"
                                innerRadius={42}
                                outerRadius={62}
                                paddingAngle={3}
                                strokeWidth={0}
                            >
                                {chartData.map((entry, i) => (
                                    <Cell key={i} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>

                    <div className="grid grid-cols-2 gap-1.5">
                        {chartData.map(({ status, count, fill }) => (
                            <div key={status} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-slate-50">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: fill }} />
                                <div className="min-w-0">
                                    <p className="text-xs text-slate-500 truncate">{STATUS_LABELS[status] ?? status}</p>
                                    <p className="text-sm font-bold text-slate-800 leading-tight">{count}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export { STATUS_COLORS }
