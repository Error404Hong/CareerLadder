"use client";

import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex bg-slate-50 overflow-hidden">

            {/* ── LEFT PANEL ── */}
            <div className="flex-1 lg:w-[45%] flex flex-col items-center justify-center bg-white px-8 py-12 relative border-r border-slate-200">

                {/* Top accent line */}
                <div className="absolute top-0 left-[10%] right-[10%] h-px bg-linear
                -to-r from-transparent via-violet-500 to-transparent" />

                {/* Clerk SignUp */}
                <div className="w-full max-w-sm">
                    <SignUp />
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="hidden lg:flex w-[55%] relative flex-col justify-end p-16 overflow-hidden">

                {/* Background image */}
                <Image
                    src="/signup-image.jpg"
                    alt="Students collaborating"
                    fill
                    priority
                    className="absolute inset-0 object-cover"
                    style={{ filter: "brightness(0.55) saturate(0.7)" }}
                />

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-linear-to-tl from-blue-600/50 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent" />

                {/* Glowing orb */}
                <div className="absolute top-[15%] right-[20%] w-96 h-96 rounded-full bg-blue-400/20 blur-[80px] animate-pulse" />

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
                <div className="relative z-10 max-w-2xl">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />
                        <span className="text-white text-sm  tracking-widest uppercase">
                            Join 12,000+ Students
                        </span>
                    </div>

                    {/* Headline */}
                    <h1
                        className="text-5xl xl:text-6xl font-black leading-[1.08] text-white mb-6 tracking-tight"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Launch Your<br />
                        Career{" "}
                        <span className="bg-linear-to-r from-blue-300 to-violet-300 bg-clip-text text-transparent">
                            Journey
                        </span>
                    </h1>

                    <p className="text-white/70 text-base leading-relaxed mb-10 font-light max-w-lg">
                        Create your profile, showcase your skills, and get matched with
                        industry opportunities tailored just for you.
                    </p>

                    {/* Steps */}
                    <div className="flex flex-col gap-4">
                        {[
                            { step: "01", title: "Build your profile", desc: "Showcase your skills, projects & experience" },
                            { step: "02", title: "Get matched", desc: "AI matches you with relevant opportunities" },
                            { step: "03", title: "Land your role", desc: "Apply, interview, and launch your career" },
                        ].map((item) => (
                            <div key={item.step} className="flex items-start gap-4 bg-white/10 border border-white/20 rounded-xl px-5 py-4 backdrop-blur-md hover:bg-white/20 transition-colors duration-300">
                                <span
                                    className="text-2xl font-black text-white/20 leading-none mt-0.5"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    {item.step}
                                </span>
                                <div>
                                    <div className="text-white  text-sm">{item.title}</div>
                                    <div className="text-white/50 text-sm mt-0.5 font-light">{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
