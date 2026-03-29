export type Notification = {
    id: number;
    recipient_id: string;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    reference_type: string | null;
    reference_id: string | null;
    created_at: string;
};
