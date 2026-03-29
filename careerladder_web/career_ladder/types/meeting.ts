export type Meeting = {
    id: string;
    application_id: string;
    company_id: string;
    applicant_id: string;
    meeting_url: string;
    room_name: string;
    title: string;
    description: string;
    meeting_type: string;
    reference_type: string;
    reference_id: string;
    reference_title: string | null;
    scheduled_at: string;
    duration: number;
    status: string;
    recording_url: string | null;
    created_at: string;
    updated_at: string;
    // enriched from Clerk
    applicant_name: string | null;
    applicant_email: string | null;
    applicant_image: string | null;

    company_email: string;
    company_logo_url: string;
    // enriched from DB join
    company_name?: string | null;
    major?: string | null;
    applicant_location?: string | null;
};
