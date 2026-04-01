import axiosInstance from "./config";

export const getTasksByProject = async (projectid: string) => {
    try {
        const response = await axiosInstance.get(`/tasks/getTasksByProject/${projectid}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching tasks: ", error);
        throw error;
    }
};

export const createTask = async (
    project_id: string,
    title: string,
    description: string | null,
    assigned_to: string | null,
    board_column: string,
    priority: string,
    due_date: string | null,
    position: number,
) => {
    try {
        const response = await axiosInstance.post("/tasks/createTask", {
            project_id,
            title,
            description,
            assigned_to,
            board_column,
            priority,
            due_date,
            position,
        });
        return response.data;
    } catch (error) {
        console.error("Error creating task: ", error);
        throw error;
    }
};

export const updateTask = async (
    taskid: string,
    title: string,
    description: string | null,
    assigned_to: string | null,
    board_column: string,
    priority: string,
    due_date: string | null,
    position: number,
) => {
    try {
        const response = await axiosInstance.put(`/tasks/updateTask/${taskid}`, {
            title,
            description,
            assigned_to,
            board_column,
            priority,
            due_date,
            position,
        });
        return response.data;
    } catch (error) {
        console.error("Error updating task: ", error);
        throw error;
    }
};

export const deleteTask = async (taskid: string) => {
    try {
        const response = await axiosInstance.delete(`/tasks/deleteTask/${taskid}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting task: ", error);
        throw error;
    }
};

export const moveTask = async (taskid: string, board_column: string, position: number) => {
    try {
        const response = await axiosInstance.put(`/tasks/moveTask/${taskid}`, {
            board_column,
            position,
        });
        return response.data;
    } catch (error) {
        console.error("Error moving task: ", error);
        throw error;
    }
};

export const reorderTasks = async (tasks: { id: string; position: number }[]) => {
    try {
        const response = await axiosInstance.put("/tasks/reorderTasks", { tasks });
        return response.data;
    } catch (error) {
        console.error("Error reordering tasks: ", error);
        throw error;
    }
};
