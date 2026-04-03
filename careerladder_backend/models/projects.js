const pool = require("../config/database");
const logger = require("../utils/logger");

class Projects {
    static async getAllProjects() {
        try {
            const query = `SELECT 
                projects.*, 
                company_profiles.company_name,
                company_profiles.website
            FROM projects 
            LEFT JOIN users ON users.clerk_id = projects.company_id
            LEFT JOIN company_profiles ON company_profiles.company_id = users.clerk_id
            WHERE projects.status = 'open' 
            ORDER BY projects.created_at DESC`;
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
                projects.end_date,
                company_profiles.company_name
            FROM applications 
            LEFT JOIN projects ON projects.id = applications.listing_id
            LEFT JOIN company_profiles ON company_profiles.company_id = projects.company_id
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

    static async getProjectsByCompany(company_id) {
        try {
            const query = `SELECT projects.*, COUNT(applications.id) AS application_count FROM projects
                LEFT JOIN applications ON projects.id = applications.listing_id
                WHERE projects.company_id = $1
                GROUP BY projects.id
                ORDER BY projects.created_at DESC
            `;

            const result = await pool.query(query, [company_id]);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to fetch company projects");
            throw error;
        }
    }

    static async deleteProjectsByCompany(projectid) {
        try {
            const query = `DELETE FROM projects WHERE id = $1 RETURNING *`;
            const result = await pool.query(query, [projectid]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to delete company projects");
            throw error;
        }
    }

    static async deleteProjectApplications(projectid) {
        try {
            const query = `DELETE FROM applications WHERE listing_id = $1 AND type = 'project' RETURNING *`;
            const result = await pool.query(query, [projectid]);
            return result.rows;
        } catch (error) {
            logger.error("[MODEL] Failed to delete project applications");
            throw error;
        }
    }

    static async createProject(
        company_id,
        title,
        description,
        skills_required,
        duration,
        allowance,
        vacancies,
        start_date,
        end_date,
    ) {
        try {
            const query = `
            INSERT INTO projects(company_id, title, description, skills_required, duration, allowance, vacancies, start_date, end_date, status)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, 'open')
            RETURNING *
        `;
            const values = [
                company_id,
                title,
                description,
                skills_required,
                duration,
                allowance,
                vacancies,
                start_date,
                end_date,
            ];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to create project: ", error);
            throw error;
        }
    }

    static async getProjectById(projectid) {
        try {
            const query = `SELECT projects.*, COUNT(applications.id) AS application_count FROM projects 
            LEFT JOIN applications ON projects.id = applications.listing_id
            WHERE projects.id = $1 GROUP BY projects.id`;

            const result = await pool.query(query, [projectid]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to get project by id: ", error);
            throw error;
        }
    }

    static async updateProject(
        id,
        title,
        description,
        skills_required,
        duration,
        allowance,
        vacancies,
        start_date,
        end_date,
        status,
    ) {
        try {
            const query = `
            UPDATE projects SET
                title = $1, description = $2, skills_required = $3,
                duration = $4, allowance = $5, vacancies = $6,
                start_date = $7, end_date = $8, status = $9,
                updated_at = NOW()
            WHERE id = $10
            RETURNING *
        `;
            const values = [
                title,
                description,
                skills_required,
                duration,
                allowance,
                vacancies,
                start_date,
                end_date,
                status,
                id,
            ];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to update project: ", error);
            throw error;
        }
    }

    static async getProjectApplicationsById(projectid) {
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
            WHERE applications.listing_id = $1 AND applications.type = 'project'
            ORDER BY applications.applied_at DESC
            `;

            const result = await pool.query(query, [projectid]);
            return result.rows ?? [];
        } catch (error) {
            logger.error(
                "[MODEL] Failed to fetch project applications: ",
                error,
            );
            throw error;
        }
    }

    static async getAllProjectApplicationByCompany(companyid) {
        try {
            const query = `
            SELECT 
                applications.*,
                applications.id AS application_id,
                applications.status AS application_status,
                projects.*,
                projects.status AS project_status,
                student_profiles.*
            FROM applications
            LEFT JOIN projects ON projects.id = applications.listing_id
            LEFT JOIN users ON users.clerk_id = applications.clerk_id
            LEFT JOIN student_profiles ON student_profiles.clerk_id = applications.clerk_id
            WHERE applications.type = 'project' AND projects.company_id = $1
            `;

            const result = await pool.query(query, [companyid]);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to fetch all project applications");
            throw error;
        }
    }

    static async updateProjectVacancies(projectid) {
        try {
            const query =
                "UPDATE projects SET vacancies = vacancies - 1 WHERE id = $1 RETURNING *";
            const result = await pool.query(query, [projectid]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to update project vacancies");
            throw error;
        }
    }

    static async updateProjectStatus(projectid, status) {
        try {
            const query =
                "UPDATE projects SET status = $1 WHERE id = $2 RETURNING *";
            const result = await pool.query(query, [status, projectid]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to update project status");
            throw error;
        }
    }

    static async getProjectApplicantsById(projectid) {
        try {
            const query = `
            SELECT users.clerk_id FROM projects 
            LEFT JOIN applications ON applications.listing_id = projects.id
            LEFT JOIN users ON users.clerk_id = applications.clerk_id
            WHERE projects.id = $1
            `;

            const result = await pool.query(query, [projectid]);
            return result.rows ?? [];
        } catch (error) {
            console.log("[MODEL] Failed to get project details: ", error);
            throw error;
        }
    }

    static async getProjectMembers(projectid) {
        try {
            const query = `
            SELECT applications.clerk_id FROM projects
            LEFT JOIN applications ON applications.listing_id = projects.id
            WHERE projects.id = $1 AND applications.status = 'accepted' 
            `;

            const result = await pool.query(query, [projectid]);
            return result.rows ?? [];
        } catch (error) {
            console.log("[MODEL] Failed to get project members: ", error);
            throw error;
        }
    }

    static async getProjectOwner(projectid) {
        try {
            const query = `
            SELECT projects.company_id, company_profiles.company_name FROM projects
            LEFT JOIN company_profiles ON company_profiles.company_id = projects.company_id
            WHERE projects.id = $1
            `;

            const result = await pool.query(query, [projectid]);
            return result.rows ?? [];
        } catch (error) {
            console.log("[MODEL] Failed to get project owner: ", error);
            throw error;
        }
    }
}

module.exports = Projects;
