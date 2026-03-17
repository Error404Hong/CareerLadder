const pool = require("../config/database");
const logger = require("../utils/logger");

class Projects {
    static async getAllProjects() {
        try {
            const query = "SELECT * FROM projects WHERE status = 'open'";
            const result = await pool.query(query);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to fetch all projects");
            throw error;
        }
    }

    static async applyProjects(
        clerkid,
        listingid,
        resumeUrl,
        coverLetter,
        skillsFulfilled,
    ) {
        try {
            const query = `INSERT INTO applications(clerk_id, listing_id, type, status, resume_url, cover_letter, skills_fulfilled)
            VALUES($1, $2, 'project', 'pending', $3, $4, $5) RETURNING *`;
            const values = [
                clerkid,
                listingid,
                resumeUrl,
                coverLetter,
                skillsFulfilled,
            ];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to apply for project");
            throw error;
        }
    }

    static async checkApplication(clerkid, listingid) {
        try {
            const query =
                "SELECT 1 FROM applications WHERE clerk_id = $1 AND listing_id = $2";
            const values = [clerkid, listingid];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to check application");
            throw error;
        }
    }
}

module.exports = Projects;
