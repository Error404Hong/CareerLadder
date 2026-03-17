const pool = require("../config/database");
const logger = require("../utils/logger");

class Jobs {
    static async getAllJobs() {
        try {
            const query = "SELECT * FROM jobs WHERE status = 'open'";
            const result = await pool.query(query);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to fetch all jobs");
            throw error;
        }
    }

    static async applyJobs(
        clerkid,
        listingid,
        resumeUrl,
        coverLetter,
        skillsFulfilled,
        expectedSalary,
        availability,
    ) {
        try {
            const query = `INSERT INTO applications(clerk_id, listing_id, type, status, resume_url, cover_letter, skills_fulfilled, expected_salary, availability)
            VALUES($1, $2, 'job', 'pending', $3, $4, $5, $6, $7) RETURNING *`;
            const values = [
                clerkid,
                listingid,
                resumeUrl,
                coverLetter,
                skillsFulfilled,
                expectedSalary,
                availability,
            ];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to apply for job position");
            throw error;
        }
    }
}

module.exports = Jobs;
