const pool = require("../config/database");

class Tasks {
    static async getTasksByProject(projectid) {
        try {
            const query = `
            SELECT * FROM tasks WHERE project_id = $1 ORDER BY board_column ASC, 
            CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END ASC`;
            const result = await pool.query(query, [projectid]);
            return result.rows ?? [];
        } catch (error) {
            console.log("[MODEL] Failed to get project tasks: ", error);
            throw error;
        }
    }

    static async createTask(
        project_id,
        assigned_to,
        title,
        description,
        board_column,
        priority,
        due_date,
    ) {
        try {
            const query = `
            INSERT INTO tasks(project_id, assigned_to, title, 
            description, board_column, priority, due_date) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
            `;
            const values = [
                project_id,
                assigned_to,
                title,
                description,
                board_column,
                priority,
                due_date,
            ];

            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            console.log("[MODEL] Failed to create task: ", error);
            throw error;
        }
    }

    static async updateTask(
        assigned_to,
        title,
        description,
        board_column,
        priority,
        due_date,
        taskid,
    ) {
        try {
            console.log("updating test");
            const query = `
            UPDATE tasks SET assigned_to = $1, title = $2, description = $3,
            board_column = $4, priority = $5, due_date = $6, 
            updated_at = NOW() WHERE id = $7 RETURNING *
            `;

            const values = [
                assigned_to,
                title,
                description,
                board_column,
                priority,
                due_date,
                taskid,
            ];

            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            console.log("[MODEL] Failed to update task: ", error);
            throw error;
        }
    }

    static async deleteTask(taskid) {
        try {
            const query = "DELETE FROM tasks WHERE id = $1";
            await pool.query(query, [taskid]);
        } catch (error) {
            console.log("[MODEL] Failed to delete task: ", error);
            throw error;
        }
    }

    static async moveTask(board_column, taskid) {
        try {
            const query = `
        UPDATE tasks SET board_column = $1, updated_at = NOW()
        WHERE id = $2 RETURNING *
        `;
            const result = await pool.query(query, [board_column, taskid]);
            return result.rows[0] ?? null;
        } catch (error) {
            console.log("[MODEL] Failed to move task: ", error);
            throw error;
        }
    }

    static async getStudentTasksByProject(clerkid, projectid) {
        try {
            const query = `
            SELECT * FROM tasks WHERE assigned_to = $1 AND project_id::uuid = $2
            ORDER BY board_column ASC, 
            CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END ASC
            `;

            const values = [clerkid, projectid];
            const result = await pool.query(query, values);
            return result.rows ?? [];
        } catch (error) {
            console.log("[MODEL] Failed to get student tasks: ", error);
            throw error;
        }
    }
}

module.exports = Tasks;
