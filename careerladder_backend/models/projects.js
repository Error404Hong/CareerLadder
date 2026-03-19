const pool = require("../config/database");
const logger = require("../utils/logger");

class Projects {
    static async getAllProjects() {
        try {
            const query =
                "SELECT * FROM projects WHERE status = 'open' ORDER BY created_at DESC";
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

    static async getUsersProjectApplications(clerk_id) {
        try {
            const query = `
            SELECT 
                applications.id,
                applications.clerk_id,
                applications.listing_id,
                applications.type,
                applications.resume_url,
                applications.cover_letter,
                applications.skills_fulfilled,
                applications.applied_at,
                applications.status AS application_status,
                projects.status AS project_status,
                projects.title,
                projects.company_id,
                projects.duration,
                projects.allowance,
                projects.start_date,
                projects.end_date
            FROM applications 
            LEFT JOIN projects ON projects.id = applications.listing_id
            WHERE applications.clerk_id = $1 AND applications.type = 'project'
            ORDER BY applications.applied_at DESC
        `;
            const result = await pool.query(query, [clerk_id]);
            return result.rows;
        } catch (error) {
            logger.error("[MODEL] Failed to get project applications: ", error);
            throw error;
        }
    }
}

module.exports = Projects;
