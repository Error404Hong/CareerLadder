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
                VALUES($1, $2, $3, $4, 0, 1)
                RETURNING *`;

            const values = [clerkid, role, current, current];
            const result = await pool.query(query, values);
            return result.rows[0] ? result.rows[0] : null;
        } catch (error) {
            logger.error("[MODEL] Error Inserting User: ", error);
            throw error;
        }
    }

    static async createStudentProfile(clerkid) {
        try {
            const query = "INSERT INTO student_profiles(clerk_id) VALUES($1)";
            const values = [clerkid];
            const result = await pool.query(query, values);
            return result.rows[0] ? result.rows[0] : null;
        } catch (error) {
            logger.error("[MODEL] Error Creating User Profile: ", error);
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

    static async getStudentProfile(clerk_id) {
        try {
            const query = "SELECT * FROM student_profiles WHERE clerk_id = $1";
            const values = [clerk_id];
            const result = await pool.query(query, values);
            return result.rows[0] ? result.rows[0] : null;
        } catch (error) {
            logger.error("[MODEL] Error Getting Student Profile: ", error);
            throw error;
        }
    }

    static async modifyUser(
        linkedin_url,
        location,
        major,
        job_preference,
        work_status,
        clerk_id,
    ) {
        try {
            const query =
                "UPDATE student_profiles SET linkedin_url = $1, location = $2, major = $3, job_preference = $4, work_status = $5 WHERE clerk_id = $6 RETURNING *";
            const values = [
                linkedin_url,
                location,
                major,
                job_preference,
                work_status,
                clerk_id,
            ];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            logger.error("[MODEL] Error Modifying User Profile: ", error);
            throw error;
        }
    }
}

module.exports = Users;
