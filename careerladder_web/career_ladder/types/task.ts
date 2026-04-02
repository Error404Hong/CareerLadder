export type Task = {
    id: string;
    project_id: string;
    assigned_to: string | null;
    title: string;
    description: string | null;
    board_column: "todo" | "in_progress" | "review" | "done";
    priority: "low" | "medium" | "high";
    due_date: string | null;
    created_at: string;
    updated_at: string;
};
