"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface YearPickerProps {
    value?: string
    onChange?: (year: string) => void
    placeholder?: string
    disabled?: boolean
}

export function YearPicker({ value, onChange, placeholder = "Pick a year", disabled }: YearPickerProps) {
    const currentYear = new Date().getFullYear()
    const START_YEAR = 2000
    const years = Array.from(
        { length: currentYear - START_YEAR + 1 },
        (_, i) => currentYear - i
    )

    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                        {year}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}