export type Job = {
    id: string;
    company_id: string;
    title: string;
    description: string;
    requirements: string;
    skills_required: string[];
    employment_type: string;
    salary_min: string;
    salary_max: string;
    location: string;
    is_remote: boolean;
    vacancies: number;
    status: string;
    created_at: string;
    updated_at: string;
    application_count: number | number;
};
