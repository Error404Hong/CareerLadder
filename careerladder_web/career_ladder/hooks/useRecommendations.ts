"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import {
    getStudentProfile,
    getStudentSkills,
    getStudentExperience,
    getStudentEducation,
} from "@/app/api/user"

export type RecommendationResult = {
    recommendedJobIds: string[]
    recommendedProjectIds: string[]
    recommendedTrainingIds: string[]
    skillGaps: string[]
    careerAdvice: string
}

type ListingJob = { id: string; title: string; skills_required: string[]; description: string }
type ListingProject = { id: string; title: string; skills_required: string[]; description: string }
type ListingTraining = { id: string; title: string; prerequisites: string; expected_outcome: string }

// Module-level set prevents double-fetch from React StrictMode (dev only)
const inflightRequests = new Set<string>()

export function useRecommendations(
    jobs: ListingJob[],
    projects: ListingProject[],
    trainings: ListingTraining[],
) {
    const { user } = useUser()
    const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const hasFetched = useRef(false)

    // Keep latest listing data accessible inside callbacks without re-triggering effects
    const jobsRef = useRef(jobs)
    const projectsRef = useRef(projects)
    const trainingsRef = useRef(trainings)
    useEffect(() => { jobsRef.current = jobs }, [jobs])
    useEffect(() => { projectsRef.current = projects }, [projects])
    useEffect(() => { trainingsRef.current = trainings }, [trainings])

    const fetchRecommendations = useCallback(async (force = false) => {
        if (!user) return

        const cacheKey = `ai_recs_${user.id}`

        // Prevent concurrent duplicate requests (React StrictMode double-invoke)
        if (inflightRequests.has(cacheKey)) return
        inflightRequests.add(cacheKey)

        if (!force) {
            const cached = sessionStorage.getItem(cacheKey)
            if (cached) {
                setRecommendations(JSON.parse(cached))
                inflightRequests.delete(cacheKey)
                return
            }
        }

        setIsLoading(true)
        setError(null)

        try {
            const [profileRes, skillsRes, experienceRes, educationRes] = await Promise.all([
                getStudentProfile(user.id),
                getStudentSkills(user.id),
                getStudentExperience(user.id),
                getStudentEducation(user.id),
            ])

            const student = {
                skills: skillsRes.data?.map((s: { name: string }) => s.name) ?? [],
                major: profileRes.data?.major ?? "",
                jobPreference: profileRes.data?.job_preference ?? "",
                location: profileRes.data?.location ?? "",
                summary: profileRes.data?.profile_summary ?? "",
                experience: experienceRes.data ?? [],
                education: educationRes.data ?? [],
            }

            const trimmedJobs = jobsRef.current.map(j => ({
                id: j.id,
                title: j.title,
                skills_required: j.skills_required ?? [],
                description: j.description?.slice(0, 100) ?? "",
            }))

            const trimmedProjects = projectsRef.current.map(p => ({
                id: p.id,
                title: p.title,
                skills_required: p.skills_required ?? [],
                description: p.description?.slice(0, 100) ?? "",
            }))

            const trimmedTrainings = trainingsRef.current.map(t => ({
                id: t.id,
                title: t.title,
                prerequisites: t.prerequisites ?? "",
                expected_outcome: t.expected_outcome ?? "",
            }))

            const res = await fetch("/api/ai/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student,
                    jobs: trimmedJobs,
                    projects: trimmedProjects,
                    trainings: trimmedTrainings,
                }),
            })

            const data = await res.json()

            if (data.success) {
                setRecommendations(data.data)
                sessionStorage.setItem(cacheKey, JSON.stringify(data.data))
            } else {
                setError(data.message || "Failed to get recommendations")
            }
        } catch {
            setError("Failed to get recommendations")
        } finally {
            setIsLoading(false)
            inflightRequests.delete(cacheKey)
        }
    }, [user])

    // Fire once when user is loaded AND at least one listing array is non-empty
    const hasListings = jobs.length > 0 || projects.length > 0 || trainings.length > 0
    useEffect(() => {
        if (!user || !hasListings || hasFetched.current) return
        hasFetched.current = true
        fetchRecommendations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, hasListings])

    const refresh = useCallback(() => {
        if (!user) return
        const cacheKey = `ai_recs_${user.id}`
        sessionStorage.removeItem(cacheKey)
        inflightRequests.delete(cacheKey)
        hasFetched.current = false
        fetchRecommendations(true)
    }, [user, fetchRecommendations])

    return { recommendations, isLoading, error, refresh }
}