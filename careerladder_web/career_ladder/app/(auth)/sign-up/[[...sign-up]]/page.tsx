"use client"

import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {

    return (
        <div className="min-h-[95vh] flex items-center justify-center">
            <SignUp />
        </div>
    );
}