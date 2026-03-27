export type ProjectPayment = {
    id: string
    application_id: string
    project_id: string
    company_id: string
    student_id: string
    total_amount: string
    paid_amount: string
    remaining_amount: string
    monthly_allowance: string
    duration_months: number
    status: string
    paid_at: string | null
    created_at: string
    project_title: string
    duration: string
    allowance: string
    student_name: string | null
    student_email: string | null
    student_image: string | null
}