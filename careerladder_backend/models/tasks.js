const pool = require("../config/database");

class Tasks {
    static async getTasksByProject(projectid) {
        try {
            const query = `SELECT * FROM tasks WHERE project_id = $1 ORDER BY board_column ASC, position ASC`;
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
        position,
    ) {
        try {
            const query = `
            INSERT INTO tasks(project_id, assigned_to, title, 
            description, board_column, priority, due_date, position) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
            `;
            const values = [
                project_id,
                assigned_to,
                title,
                description,
                board_column,
                priority,
                due_date,
                position,
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
        position,
        taskid,
    ) {
        try {
            const query = `
            UPDATE tasks SET assigned_to = $1, title = $2, description = $3,
            board_column = $4, priority = $5, due_date = $6, position = $7, 
            updated_at = NOW() WHERE id = $8 RETURNING *
            `;

            const values = [
                assigned_to,
                title,
                description,
                board_column,
                priority,
                due_date,
                position,
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

    static async moveTask(board_column, position, taskid) {
        try {
            const query = `
        UPDATE tasks SET board_column = $1, position = $2, updated_at = NOW()
        WHERE id = $3 RETURNING *
        `;
            const result = await pool.query(query, [
                board_column,
                position,
                taskid,
            ]);
            return result.rows[0] ?? null;
        } catch (error) {
            console.log("[MODEL] Failed to move task: ", error);
            throw error;
        }
    }

    static async reorderTasks(tasks) {
        // tasks = [{ id, position }, ...]
        try {
            const queries = tasks.map((t) =>
                pool.query(
                    `UPDATE tasks SET position = $1, updated_at = NOW() WHERE id = $2`,
                    [t.position, t.id],
                ),
            );
            await Promise.all(queries);
        } catch (error) {
            console.log("[MODEL] Failed to reorder tasks: ", error);
            throw error;
        }
    }
}

module.exports = Tasks;
