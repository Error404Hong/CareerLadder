const pool = require("../config/database");
const logger = require("../utils/logger");

class Jobs {
    static async getAllJobs() {
        try {
            const query =
                "SELECT * FROM jobs WHERE status = 'open' ORDER BY created_at DESC";
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

    static async getUsersJobApplications(clerkid) {
        try {
            const query = `SELECT 
                applications.id,
                applications.clerk_id,
                applications.listing_id,
                applications.type,
                applications.resume_url,
                applications.cover_letter,
                applications.skills_fulfilled,
                applications.applied_at,
                applications.status AS application_status,
                jobs.status AS job_status,
                jobs.title,
                jobs.company_id,
                jobs.employment_type,
                jobs.location,
                jobs.salary_min,
                jobs.salary_max
            FROM applications 
            LEFT JOIN jobs ON jobs.id = applications.listing_id
            WHERE applications.clerk_id = $1 AND applications.type = 'job'
            ORDER BY applications.applied_at DESC`;

            const values = [clerkid];
            const result = await pool.query(query, values);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to get applied jobs");
            throw error;
        }
    }

    static async getJobsByCompany(companyid) {
        try {
            const query = `SELECT 
                jobs.*,
                COUNT(applications.id) AS application_count
            FROM jobs
            LEFT JOIN applications ON jobs.id = applications.listing_id
            WHERE jobs.company_id = $1
            GROUP BY jobs.id
            ORDER BY jobs.created_at DESC`;
            const result = await pool.query(query, [companyid]);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to job listings");
            throw error;
        }
    }
}

module.exports = Jobs;
