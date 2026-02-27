const pool = require("../config/database");

class Users {
    static async addNewUser(clerkid, role) {
        try {
            const now = new Date();
            const current = now
                .toISOString()
                .replace("T", " ")
                .replace("Z", "");

            const query = `INSERT INTO users(clerk_id, role, created_at, updated_at)
                VALUES($1, $2, $3, $4)`;

            const values = [clerkid, role, current, current];
            const result = await pool.query(query, values);
            return result.rows[0] ? result.rows[0] : null;
        } catch (error) {
            console.error("Error Inserting User: ", error);
            throw error;
        }
    }
}

module.exports = Users;
