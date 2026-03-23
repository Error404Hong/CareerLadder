"use client"


import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"

import { getProjectAppByCom } from "@/app/api/project";

import { toast } from "sonner";

export default function ProjectApplicationManagement() {
    const { user } = useUser();

    useEffect(() => {
        if (!user) return;

        const getJobApplications = async () => {
            const fetchRes = await getProjectAppByCom(user.id);

            if (fetchRes.success) {
                console.log(fetchRes.data);
            } else {
                toast.error("Failed to fetch project applications. Please try again")
            }
        }

        getJobApplications();
    }, [user])

    return "hi"
}