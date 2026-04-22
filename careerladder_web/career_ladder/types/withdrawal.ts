export type Withdrawal = {
    id: string
    student_id: string
    bank_id: string
    amount: string
    status: "pending" | "approved" | "rejected" | "completed"
    admin_note: string | null
    requested_at: string
    reviewed_at: string | null
    completed_at: string | null
    // enriched via JOIN with student_bank_accounts
    bank_name: string
    account_number: string
    account_holder_name: string
}