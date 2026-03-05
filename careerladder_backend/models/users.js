const pool = require("../config/database");
const logger = require("../utils/logger");

class Users {
    static async addNewUser(clerkid, role) {
        try {
            const now = new Date();
            const current = now
                .toISOString()
                .replace("T", " ")
                .replace("Z", "");

            const query = `INSERT INTO users(clerk_id, role, created_at, updated_at, profile_completed, status)
                VALUES($1, $2, $3, $4, 0, 1)`;

            const values = [clerkid, role, current, current];
            const result = await pool.query(query, values);
            return result.rows[0] ? result.rows[0] : null;
        } catch (error) {
            logger.error("[MODEL] Error Inserting User: ", error);
            throw error;
        }
    }

    static async getUser(clerkid) {
        try {
            const query = "SELECT * FROM users WHERE clerk_id = $1";
            const values = [clerkid];
            const result = await pool.query(query, values);

            return result.rows[0] ? result.rows[0] : null;
        } catch (error) {
            logger.error("[MODEL] Error Getting User: ", error);
            throw error;
        }
    }
}

module.exports = Users;
