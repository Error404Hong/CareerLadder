import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
    return (
        <div className="max-h-screen bg-pink-200 flex items-center justify-center">
            <SignUp />
        </div>
    );
}