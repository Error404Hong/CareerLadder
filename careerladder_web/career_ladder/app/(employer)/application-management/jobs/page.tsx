"use client"


import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"

import { getAllJobAppByCom } from "@/app/api/job";

import { toast } from "sonner";

export default function JobApplicationManagement() {
    const { user } = useUser();

    useEffect(() => {
        if (!user) return;

        const getJobApplications = async () => {
            const fetchRes = await getAllJobAppByCom(user.id);

            if (fetchRes.success) {
                console.log(fetchRes.data);
            } else {
                toast.error("Failed to fetch job applications. Please try again")
            }
        }

        getJobApplications();
    }, [user])

    return "hi"
}