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

    static async getStudentSkills(clerkid) {
        try {
            const query = "SELECT * FROM student_skills WHERE clerk_id = $1";
            const values = [clerkid];
            const result = await pool.query(query, values);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to get student skills: ", error);
            throw error;
        }
    }

    static async addNewSkill(clerkid, skill) {
        try {
            const query =
                "INSERT INTO student_skills(clerk_id, name) VALUES($1, $2) RETURNING *";
            const values = [clerkid, skill];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to add new skill: ", error);
            throw error;
        }
    }

    static async removeSkill(id) {
        try {
            const query = "DELETE FROM student_skills WHERE id = $1";
            const values = [id];
            await pool.query(query, values);
        } catch (error) {
            logger.error("[MODEL] Failed to removeskill: ", error);
            throw error;
        }
    }

    static async addLanguage(clerk_id, language, proficiency) {
        try {
            const query =
                "INSERT INTO student_languages(clerk_id, language, proficiency) VALUES($1, $2, $3) RETURNING *";
            const values = [clerk_id, language, proficiency];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to add language: ", error);
            throw error;
        }
    }

    static async getLanguages(clerk_id) {
        try {
            const query = "SELECT * FROM student_languages WHERE clerk_id = $1";
            const values = [clerk_id];
            const result = await pool.query(query, values);
            return result.rows;
        } catch (error) {
            logger.error("[MODEL] Failed to get languages: ", error);
            throw error;
        }
    }

    static async deleteLanguage(id) {
        try {
            const query =
                "DELETE FROM student_languages WHERE id = $1 RETURNING *";
            const values = [id];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to delete language: ", error);
            throw error;
        }
    }

    static async checkProfileCompleted(clerk_id) {
        try {
            const query = `
            SELECT 
                sp.major, sp.location, sp.linkedin_url, sp.profile_summary,
                (SELECT COUNT(*) FROM student_education WHERE clerk_id = $1) as edu_count,
                (SELECT COUNT(*) FROM student_experience WHERE clerk_id = $1) as exp_count,
                (SELECT COUNT(*) FROM student_skills WHERE clerk_id = $1) as skill_count,
                (SELECT COUNT(*) FROM student_languages WHERE clerk_id = $1) as language_count,
                (SELECT resume FROM student_profiles WHERE clerk_id = $1) as resume
            FROM student_profiles sp
            WHERE sp.clerk_id = $1
        `;
            const result = await pool.query(query, [clerk_id]);
            const data = result.rows[0];

            const isCompleted =
                data.major &&
                data.location &&
                data.linkedin_url &&
                data.profile_summary &&
                parseInt(data.edu_count) > 0 &&
                parseInt(data.exp_count) > 0 &&
                parseInt(data.skill_count) > 0 &&
                parseInt(data.language_count) > 0 &&
                data.resume;

            await pool.query(
                "UPDATE users SET profile_completed = $1 WHERE clerk_id = $2",
                [isCompleted ? 1 : 0, clerk_id],
            );

            return isCompleted ? 1 : 0;
        } catch (error) {
            logger.error("[MODEL] Error checking profile completion: ", error);
            throw error;
        }
    }

    static async createCompanyProfile(companyid) {
        try {
            const query =
                "INSERT INTO company_profiles(company_id) VALUES ($1)";
            const result = await pool.query(query, [companyid]);
            return result.rows[0] ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to create company profile");
            throw error;
        }
    }

    static async updateCompanyProfile(
        company_name,
        industry,
        company_size,
        founded_year,
        website,
        location,
        company_id,
    ) {
        try {
            const query = `UPDATE company_profiles SET company_name = $1, industry = $2, company_size = $3, founded_year = $4,
            website = $5, location = $6, updated_at = NOW() WHERE company_id = $7 RETURNING *`;
            const values = [
                company_name,
                industry,
                company_size,
                founded_year,
                website,
                location,
                company_id,
            ];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            logger.error("[MODEL] Failed to update company profile");
            throw error;
        }
    }

    static async getCompanyProfile(companyid) {
        try {
            const query =
                "SELECT * FROM company_profiles WHERE company_id = $1";
            const result = await pool.query(query, [companyid]);
            return result.rows[0] ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to fetch company profile");
            throw error;
        }
    }

    static async updateCompanyDesciption(description, company_id) {
        try {
            const query = `UPDATE company_profiles SET description = $1 WHERE company_id = $2 RETURNING *`;
            const values = [description, company_id];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            logger.error("[MODEL] Failed to update company description");
            throw error;
        }
    }

    static async checkCompanyProfileCompleted(clerk_id) {
        try {
            const query = `
            SELECT 
                cp.company_name,
                cp.industry,
                cp.company_size,
                cp.founded_year,
                cp.location,
                cp.description
            FROM company_profiles cp
            WHERE cp.company_id = $1
        `;
            const result = await pool.query(query, [clerk_id]);
            const data = result.rows[0];

            const isCompleted =
                data.company_name &&
                data.industry &&
                data.company_size &&
                data.founded_year &&
                data.location &&
                data.description;

            await pool.query(
                "UPDATE users SET profile_completed = $1 WHERE clerk_id = $2",
                [isCompleted ? 1 : 0, clerk_id],
            );

            return isCompleted ? 1 : 0;
        } catch (error) {
            logger.error(
                "[MODEL] Error checking company profile completion: ",
                error,
            );
            throw error;
        }
    }
}

module.exports = Users;
