"use client"

import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex bg-slate-50 overflow-hidden">

            {/* ── LEFT PANEL ── */}
            <div className="hidden lg:flex w-[55%] relative flex-col justify-end p-16 overflow-hidden">

                {/* Background image */}
                <Image
                    src="/signin-image.jpg"
                    alt="Students collaborating"
                    fill
                    priority
                    className="absolute inset-0 object-cover"
                    style={{ filter: "brightness(0.55) saturate(0.7)" }}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-tr from-violet-600/50 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent" />

                {/* Glowing orb */}
                <div className="absolute top-[10%] left-[20%] w-96 h-96 rounded-full bg-violet-400/20 blur-[80px] animate-pulse" />

                {/* Grid lines */}
                <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage:
                            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                    }}
                />

                {/* Content */}
                <div className="relative z-10 max-w-lg">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-300 animate-pulse" />
                        <span className="text-white text-xs font-medium tracking-widest uppercase">
                            Student · Industry Bridge
                        </span>
                    </div>

                    {/* Headline */}
                    <h1
                        className="text-5xl xl:text-6xl font-black leading-[1.08] text-white mb-6 tracking-tight"
                        style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                        Where Talent<br />
                        Meets{" "}
                        <span className="bg-linear-to-r from-violet-300 to-blue-300 bg-clip-text text-transparent">
                            Opportunity
                        </span>
                    </h1>

                    <p className="text-white/70 text-base leading-relaxed mb-10 font-light max-w-sm">
                        Connect with top companies, land internships, and launch your career —
                        all from one platform built for the next generation.
                    </p>

                    {/* Stats */}
                    <div className="flex gap-4 flex-wrap">
                        {[
                            { number: "12K+", label: "Students" },
                            { number: "340+", label: "Companies" },
                            { number: "89%", label: "Placement Rate" },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className="bg-white/15 border border-white/25 rounded-xl px-5 py-3 backdrop-blur-md hover:bg-white/25 transition-colors duration-300"
                            >
                                <div
                                    className="text-2xl font-bold text-white"
                                    style={{ fontFamily: "var(--font-playfair), serif" }}
                                >
                                    {s.number}
                                </div>
                                <div className="text-[11px] text-white/60 uppercase tracking-widest mt-0.5">
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="flex-1 lg:w-[45%] flex flex-col items-center justify-center bg-white px-8 py-12 relative border-l border-slate-200">

                {/* Top accent line */}
                <div className="absolute top-0 left-[10%] right-[10%] h-px bg-linear-to-r from-transparent via-violet-500 to-transparent" />


                {/* Clerk SignIn */}
                <div className="w-full max-w-sm">
                    <SignIn />
                </div>


            </div>
        </div>
    );
}
