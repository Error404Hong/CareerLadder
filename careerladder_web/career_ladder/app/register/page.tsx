"use client"

import Link from "next/link"
import Image from "next/image"
import { GraduationCap, Briefcase } from "lucide-react"

export default function RegisterSelectPage() {
    return (
        <div className="min-h-screen flex bg-slate-100 overflow-hidden">

            {/* ── LEFT PANEL ── */}
            <div className="hidden lg:flex w-[55%] relative flex-col justify-end p-16 overflow-hidden">
                <Image
                    src="/signup-image.jpg"
                    alt="Students collaborating"
                    fill
                    priority
                    className="absolute inset-0 object-cover"
                    style={{ filter: "brightness(0.55) saturate(0.7)" }}
                />
                <div className="absolute inset-0 bg-linear-to-tl from-blue-600/50 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute top-[15%] right-[20%] w-96 h-96 rounded-full bg-blue-400/20 blur-[80px] animate-pulse" />
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

                <div className="relative z-10 max-w-lg">
                    <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />
                        <span className="text-white text-sm tracking-widest uppercase">Student · Industry Bridge</span>
                    </div>
                    <h1 className="text-5xl xl:text-6xl font-black leading-[1.08] text-white mb-6 tracking-tight">
                        Choose Your<br />
                        <span className="bg-linear-to-r from-blue-300 to-violet-300 bg-clip-text text-transparent">
                            Path
                        </span>
                    </h1>
                    <p className="text-white/70 text-base leading-relaxed font-light max-w-sm">
                        Whether you are looking for opportunities or looking to hire — CareerLadder connects both worlds.
                    </p>
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="flex-1 lg:w-[45%] flex flex-col items-center justify-center bg-white px-8 py-12 relative border-l border-slate-200">
                <div className="absolute top-0 left-[10%] right-[10%] h-px bg-linear-to-r from-transparent via-violet-500 to-transparent" />

                <div className="w-full max-w-sm">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">Create an account</h2>
                        <p className="text-sm text-slate-400 mt-1">Select your role to get started</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Link href="/sign-up?role=student">
                            <div className="bg-white border border-slate-200 hover:border-[#0f172a] hover:shadow-md rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 cursor-pointer group">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-[#0f172a] flex items-center justify-center shrink-0 transition-colors">
                                    <GraduationCap size={22} className="text-slate-400 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <p className="font-semibold text-[#0f172a] text-sm">Student</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Browse jobs, projects and training programs</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/sign-up?role=employer">
                            <div className="bg-white border border-slate-200 hover:border-[#0f172a] hover:shadow-md rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 cursor-pointer group">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-[#0f172a] flex items-center justify-center shrink-0 transition-colors">
                                    <Briefcase size={22} className="text-slate-400 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <p className="font-semibold text-[#0f172a] text-sm">Employer</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Post jobs, projects and find top talent</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <p className="text-center text-sm text-slate-400 mt-6">
                        Already have an account?{" "}
                        <Link href="/sign-in" className="text-[#2563eb] hover:underline font-medium">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}