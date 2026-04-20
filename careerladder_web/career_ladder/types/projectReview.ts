export type ProjectReview = {
    id: string;
    project_id: string;
    rating: number;
    review_text: string;
    created_at: string;
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_image: string;
    project_title?: string;
    company_name?: string;
    company_id?: string;
};
