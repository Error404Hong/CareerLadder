export type Project = {
    id: string;
    company_id: string;
    title: string;
    description: string;
    skills_required: string[];
    duration: string;
    allowance: string;
    vacancies: number;
    status: string;
    start_date: string;
    end_date: string;
    application_count: string | number;
    created_at: string;
    updated_at: string;
};
