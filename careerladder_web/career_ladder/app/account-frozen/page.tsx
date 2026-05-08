import Link from "next/link"
import { Snowflake } from "lucide-react"

export default function AccountFrozenPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                    <Snowflake size={28} className="text-blue-500" />
                </div>

                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-[#0f172a]">Account Frozen</h1>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Your account has been frozen by an administrator. You cannot log in at this time. Please contact support if you believe this is an error.
                    </p>
                </div>

                <Link
                    href="/sign-in"
                    className="text-sm text-[#2563eb] hover:underline font-medium"
                >
                    Back to Sign In
                </Link>
            </div>
        </div>
    )
}
