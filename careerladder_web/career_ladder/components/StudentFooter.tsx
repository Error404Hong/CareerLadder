import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react"

const quickLinks = [
    { label: "Home", href: "/home" },
    { label: "Project Listings", href: "/projects" },
    { label: "Job Positions", href: "/jobs" },
    { label: "Training Programs", href: "/training" },
    { label: "Company Reviews", href: "/companies" },
    { label: "My Achievements & Reviews", href: "/achivements" },
    { label: "My Profile", href: "/profile" },
]

const activityLinks = [
    { label: "Track Applications", href: "/applications" },
    { label: "Training Registrations", href: "/registrations" },
    { label: "My Meetings", href: "/my-meetings" },
    { label: "My Workspace", href: "/my-workspace" },
    { label: "My Messages", href: "/my-messages" },
    { label: "Finance", href: "/my-finance" },
]

export function StudentFooter() {
    return (
        <footer className="bg-[#0f172a] text-slate-400">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

                    {/* Brand column */}
                    <div className="md:col-span-1 flex flex-col gap-4">
                        <Link href="/home" className="inline-block">
                            <Image
                                src="/careerladder-logo-v2.png"
                                alt="CareerLadder"
                                width={148}
                                height={36}
                                className="brightness-0 invert opacity-90"
                            />
                        </Link>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Connecting students with real-world opportunities — projects, jobs, and training programs to accelerate your career.
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            Platform is online
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div>
                        <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4">Opportunities</p>
                        <ul className="flex flex-col gap-2.5">
                            {quickLinks.map(link => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-1 group"
                                    >
                                        {link.label}
                                        <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* My Activities */}
                    <div>
                        <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4">My Activities</p>
                        <ul className="flex flex-col gap-2.5">
                            {activityLinks.map(link => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-1 group"
                                    >
                                        {link.label}
                                        <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4">Contact & Support</p>
                        <ul className="flex flex-col gap-3">
                            <li>
                                <a
                                    href="mailto:support@careerladder.com"
                                    className="flex items-start gap-2.5 text-sm text-slate-500 hover:text-white transition-colors group"
                                >
                                    <Mail size={14} className="mt-0.5 shrink-0" />
                                    <span>support@careerladder.com</span>
                                </a>
                            </li>
                            <li>
                                <div className="flex items-start gap-2.5 text-sm text-slate-500">
                                    <Phone size={14} className="mt-0.5 shrink-0" />
                                    <span>+60 3-1234 5678</span>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-start gap-2.5 text-sm text-slate-500">
                                    <MapPin size={14} className="mt-0.5 shrink-0" />
                                    <span>Malaysia</span>
                                </div>
                            </li>
                        </ul>

                        <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                Having issues? Reach out to our support team and we&apos;ll get back to you within 24 hours.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-slate-600">
                        &copy; {new Date().getFullYear()} CareerLadder. All rights reserved.
                    </p>
                    <p className="text-xs text-slate-700">
                        Built for students, powered by opportunity.
                    </p>
                </div>
            </div>
        </footer>
    )
}
