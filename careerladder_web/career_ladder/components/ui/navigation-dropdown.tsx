"use client"

import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import type { NavItem } from "@/lib/nav"

export default function NavDropdown({ item }: { item: NavItem }) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    if (item.href) {
        return (
            <Link
                href={item.href}
                className="text-sm  px-3 py-2 rounded-lg text-slate-500 hover:text-[#0f172a] hover:bg-slate-50 transition-colors"
            >
                {item.label}
            </Link>
        )
    }

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-1.5 text-sm  font-inter px-3 py-2 rounded-lg transition-colors cursor-pointer ${open ? "bg-slate-100 text-[#0f172a]" : "text-slate-500 hover:text-[#0f172a] hover:bg-slate-50"}`}
            >
                {item.label}
                <ChevronDown size={11} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-1.5 w-56 bg-white border border-slate-100 rounded-xl shadow-lg shadow-slate-200/50 py-1.5 z-50">
                    {item.links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className="block px-4 py-2 text-sm text-slate-500 hover:text-[#0f172a] hover:bg-slate-50 transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}