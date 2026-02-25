import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
    return (
        <div className="min-h-[95vh] bg-pink-200 flex items-center justify-center">
            <SignUp />
        </div>
    );
}