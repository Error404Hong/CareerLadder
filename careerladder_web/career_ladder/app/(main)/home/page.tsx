"use client"

import { useUser } from "@clerk/nextjs";
import { getUserById } from "@/app/api/user";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function HomePage() {
    const router = useRouter();
    const { user } = useUser();
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            if (!user) return;

            const userData = await getUserById(user.id);
            console.log("data: ", userData.data);

            if (userData.data.profile_completed == '0') {
                setOpenDialog(true)
            }
        }

        getUser();
    }, [user])




    return (
        <div className="min-h-screen flex items-center justify-center flex-col">

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-(--color-navy)">
                            Complete your profile
                        </DialogTitle>
                        <DialogDescription>
                            Your profile is incomplete. Fill in your details to get matched with the best opportunities.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={() => setOpenDialog(false)}
                            className="px-4 py-2 text-sm text-slate-500 hover:text-(--color-navy) transition-colors cursor-pointer rounded-lg border-2"
                        >
                            Later
                        </button>
                        <button
                            onClick={() => {
                                setOpenDialog(false);
                                router.push(`/profile`)
                            }}
                            className="px-4 py-2 text-sm bg-(--color-navy) hover:bg-(--color-navy-mid) text-white rounded-lg transition-colors shadow-md shadow-blue-200 cursor-pointer"
                        >
                            Complete Profile
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}