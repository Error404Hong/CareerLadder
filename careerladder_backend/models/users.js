const { removeResume } = require("../config/cloudinary");
const pool = require("../config/database");
const logger = require("../utils/logger");

class Users {
    static async addNewUser(clerkid, role) {
        try {
            const query = `INSERT INTO users(clerk_id, role, created_at, updated_at, profile_completed, status)
                VALUES($1, $2, NOW(), NOW(), 0, 1)
                RETURNING *`;

            const values = [clerkid, role];
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

    static async modifyProfileSummary(summary, clerk_id) {
        try {
            const query =
                "UPDATE student_profiles SET profile_summary = $1 WHERE clerk_id = $2 RETURNING *";
            const values = [summary, clerk_id];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            logger.error("[MODEL] Error Modifying Profile Summary: ", error);
            throw error;
        }
    }

    static async getStudentEducation(clerk_id) {
        try {
            const query = "SELECT * FROM student_education WHERE clerk_id = $1";
            const values = [clerk_id];
            const result = await pool.query(query, values);
            return result.rows;
        } catch (error) {
            logger.error("[MODEL] Error Getting Student Education: ", error);
            throw error;
        }
    }

    static async addNewEducation(
        clerk_id,
        institution,
        field,
        start_year,
        end_year,
        is_current,
    ) {
        try {
            const query = `INSERT INTO student_education(clerk_id, institution, field, start_year, end_year, is_current, created_at, updated_at) 
                VALUES($1, $2, $3, $4, $5, $6, NOW(), NOW())
                RETURNING *`;
            const values = [
                clerk_id,
                institution,
                field,
                start_year,
                end_year,
                is_current,
            ];
            const result = await pool.query(query, values);
            return result.rows[0] ? result.rows[0] : null;
        } catch (error) {
            logger.error("[MODEL] Error Adding New Education: ", error);
            throw error;
        }
    }

    static async deleteEducation(education_id) {
        try {
            const query = "DELETE FROM student_education WHERE id = $1";
            const values = [education_id];
            await pool.query(query, values);
        } catch (error) {
            logger.error("[MODEL] Error Deleting Education Record: ", error);
            throw error;
        }
    }

    static async editEducation(
        institution,
        field,
        start_year,
        end_year,
        is_current,
        educationid,
    ) {
        try {
            const query = `UPDATE student_education SET institution = $1, field = $2, start_year = $3, end_year = $4, 
            is_current = $5, updated_at = NOW() WHERE id = $6 RETURNING *`;
            const values = [
                institution,
                field,
                start_year,
                end_year,
                is_current,
                educationid,
            ];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            logger.error("[MODEL] Error Modifying Education Record: ", error);
            throw error;
        }
    }

    static async getStudentExperience(clerk_id) {
        try {
            const query = `SELECT * FROM student_experience WHERE clerk_id = $1`;
            const values = [clerk_id];
            const result = await pool.query(query, values);
            return result.rows;
        } catch (error) {
            logger.error("[MODEL] Error getting student experience: ", error);
            throw error;
        }
    }

    static async addNewExperience(
        clerk_id,
        jobtitle,
        company,
        start_year,
        end_year,
        is_current,
        jobdescription,
        location,
        employment_type,
    ) {
        try {
            const query = `INSERT INTO student_experience(clerk_id, jobtitle, company, start_year, end_year, is_current, job_description, 
            location, employment_type, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING *`;
            const values = [
                clerk_id,
                jobtitle,
                company,
                start_year,
                end_year,
                is_current,
                jobdescription,
                location,
                employment_type,
            ];
            const result = await pool.query(query, values);
            return result.rows[0] ? result.rows[0] : null;
        } catch (error) {
            logger.error("[MODEL] Error Adding New Experience Record: ", error);
            throw error;
        }
    }

    static async deleteExperience(experienceId) {
        try {
            const query = "DELETE FROM student_experience WHERE id = $1";
            const values = [experienceId];
            await pool.query(query, values);
        } catch (error) {
            logger.error("[MODEL] Error Deleting Experience Record: ", error);
            throw error;
        }
    }

    static async editExperience(
        jobtitle,
        company,
        start_year,
        end_year,
        is_current,
        jobdescription,
        location,
        employment_type,
        experience_id,
    ) {
        try {
            const query = `UPDATE student_experience SET jobtitle = $1, company = $2, start_year = $3, end_year = $4, is_current = $5, 
            job_description = $6, location = $7, employment_type = $8, updated_at = NOW() WHERE id = $9 RETURNING *`;
            const values = [
                jobtitle,
                company,
                start_year,
                end_year,
                is_current,
                jobdescription,
                location,
                employment_type,
                experience_id,
            ];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            logger.error("[MODEL] Error Editing Experience Record: ", error);
            throw error;
        }
    }

    static async saveResume(resumeURL, clerkid) {
        try {
            const query =
                "UPDATE student_profiles SET resume = $1 WHERE clerk_id = $2 RETURNING *";
            const values = [resumeURL, clerkid];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to upload student resume: ", error);
            throw error;
        }
    }

    static async deleteResume(clerkid) {
        try {
            const selectQuery =
                "SELECT resume FROM student_profiles WHERE clerk_id = $1";
            const selectResult = await pool.query(selectQuery, [clerkid]);
            const resumeUrl = selectResult.rows[0]?.resume;

            if (resumeUrl) {
                const publicId = resumeUrl
                    .split("/")
                    .slice(-2)
                    .join("/")
                    .split(".")[0];
                await removeResume(publicId);
            }

            const query =
                "UPDATE student_profiles SET resume = NULL WHERE clerk_id = $1 RETURNING *";
            const result = await pool.query(query, [clerkid]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to delete student resume: ", error);
            throw error;
        }
    }
}

module.exports = Users;
