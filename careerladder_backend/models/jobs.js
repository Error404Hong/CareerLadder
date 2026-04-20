const pool = require("../config/database");
const logger = require("../utils/logger");

class Jobs {
    static async getAllJobs() {
        try {
            const query = `
            SELECT 
                jobs.*, 
                company_profiles.company_name,
                company_profiles.website
            FROM jobs 
            LEFT JOIN users ON users.clerk_id = jobs.company_id
            LEFT JOIN company_profiles ON company_profiles.company_id = users.clerk_id
            ORDER BY jobs.created_at DESC
            `;
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
                jobs.salary_max,
                company_profiles.company_name
            FROM applications 
            LEFT JOIN jobs ON jobs.id = applications.listing_id
            LEFT JOIN company_profiles ON company_profiles.company_id = jobs.company_id
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

    static async createJob(
        company_id,
        title,
        description,
        requirements,
        skills_required,
        employment_type,
        salary_min,
        salary_max,
        location,
        is_remote,
        vacancies,
    ) {
        try {
            const query = `
            INSERT INTO jobs(company_id, title, description, requirements, skills_required, employment_type, salary_min, salary_max, location, is_remote, vacancies, status)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'open')
            RETURNING *
        `;
            const values = [
                company_id,
                title,
                description,
                requirements,
                skills_required,
                employment_type,
                salary_min,
                salary_max,
                location,
                is_remote,
                vacancies,
            ];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to create new job: ", error);
            throw error;
        }
    }

    static async deleteJob(id) {
        try {
            const query = "DELETE FROM jobs WHERE id = $1";
            await pool.query(query, [id]);
        } catch (error) {
            logger.error("[MODEL] Failed to delete job: ", error);
            throw error;
        }
    }

    static async getJobById(id) {
        try {
            const query = `SELECT jobs.*, COUNT(applications.id) AS application_count FROM jobs 
            LEFT JOIN applications ON jobs.id = applications.listing_id
            WHERE jobs.id = $1 GROUP BY jobs.id`;
            const result = await pool.query(query, [id]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to fetch job by id: ", error);
            throw error;
        }
    }

    static async updateJob(
        id,
        title,
        description,
        requirements,
        skills_required,
        employment_type,
        salary_min,
        salary_max,
        location,
        is_remote,
        vacancies,
    ) {
        try {
            const query = `
            UPDATE jobs SET
                title = $1,
                description = $2,
                requirements = $3,
                skills_required = $4,
                employment_type = $5,
                salary_min = $6,
                salary_max = $7,
                location = $8,
                is_remote = $9,
                vacancies = $10,
                updated_at = NOW()
            WHERE id = $11
            RETURNING *
        `;
            const values = [
                title,
                description,
                requirements,
                skills_required,
                employment_type,
                salary_min,
                salary_max,
                location,
                is_remote,
                vacancies,
                id,
            ];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to update job: ", error);
            throw error;
        }
    }

    static async getJobApplicationById(job_id) {
        try {
            const query = `
            SELECT
                applications.id,
                applications.clerk_id,
                applications.listing_id,
                applications.status,
                applications.cover_letter,
                applications.skills_fulfilled,
                applications.resume_url,
                applications.expected_salary,
                applications.availability,
                applications.applied_at,
                users.role,
                sp.major,
                sp.location,
                sp.linkedin_url,
                sp.profile_summary
            FROM applications
            LEFT JOIN users ON users.clerk_id = applications.clerk_id
            LEFT JOIN student_profiles sp ON sp.clerk_id = applications.clerk_id
            WHERE applications.listing_id = $1 AND applications.type = 'job'
            ORDER BY applications.applied_at DESC
        `;
            const result = await pool.query(query, [job_id]);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to fetch job applications: ", error);
            throw error;
        }
    }

    static async getApplicantsProfile(application_id) {
        try {
            const query = `
            SELECT
                applications.*,
                sp.major,
                sp.location,
                sp.linkedin_url,
                sp.profile_summary
            FROM applications
            LEFT JOIN student_profiles sp ON sp.clerk_id = applications.clerk_id
            WHERE applications.id = $1
        `;
            const result = await pool.query(query, [application_id]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to fetch applicants profile: ", error);
            throw error;
        }
    }

    static async updateApplicationStatus(application_id, status) {
        try {
            const query = `UPDATE applications SET status = $1 WHERE id = $2 RETURNING *`;
            const result = await pool.query(query, [status, application_id]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error(
                "[MODEL] Failed to update application status: ",
                error,
            );
            throw error;
        }
    }

    static async getAllJobsApplicationByCompany(company_id) {
        try {
            const query = `
            SELECT 
                applications.*,
                applications.id AS application_id,
                applications.status AS application_status,
                jobs.*,
                jobs.status AS job_status,
                student_profiles.*
            FROM applications
            LEFT JOIN jobs ON jobs.id = applications.listing_id
            LEFT JOIN users ON users.clerk_id = applications.clerk_id
            LEFT JOIN student_profiles ON student_profiles.clerk_id = applications.clerk_id
            WHERE applications.type = 'job' AND jobs.company_id = $1
            `;

            const result = await pool.query(query, [company_id]);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to fetch all job applications");
            throw error;
        }
    }

    static async updateJobVacancies(jobid) {
        try {
            const query =
                "UPDATE jobs SET vacancies = vacancies - 1 WHERE id = $1 RETURNING *";
            const result = await pool.query(query, [jobid]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to updated job vacancies");
            throw error;
        }
    }

    static async updateJobStatus(status, jobid) {
        try {
            const query =
                "UPDATE jobs SET status = $1 WHERE id = $2 RETURNING *";
            const result = await pool.query(query, [status, jobid]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to update job status");
            throw error;
        }
    }
}

module.exports = Jobs;
