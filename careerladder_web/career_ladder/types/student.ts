export type Student = {
    id: number;
    clerk_id: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImage: string;

    profile_summary: string;
    profile_completed: number;

    location: string;
    major: string;
    job_preference: string;
    work_status: boolean;

    linkedin_url: string;
    resume: string;

    role: number;
    status: number;

    created_at: string; // ISO string
    updated_at: string; // ISO string
};
