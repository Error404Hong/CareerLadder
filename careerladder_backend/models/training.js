const pool = require("../config/database");
const logger = require("../utils/logger");

class Training {
    static async getAllTrainingPrograms() {
        try {
            const query = `
            SELECT training_programs.*, 
            company_profiles.company_name,
            company_profiles.website
            FROM training_programs 
            LEFT JOIN users ON users.clerk_id = training_programs.company_id
            LEFT JOIN company_profiles ON company_profiles.company_id = users.clerk_id
            WHERE training_programs.status = 'open' 
            ORDER BY training_programs.created_at DESC
            `;
            const result = await pool.query(query);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to fetch training programs");
            throw error;
        }
    }

    static async registerTraining(clerk_id, training_id) {
        try {
            const query = `INSERT INTO training_registration(clerk_id, training_id)
                       VALUES($1, $2) RETURNING *`;
            const values = [clerk_id, training_id];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to register training: ", error);
            throw error;
        }
    }

    static async checkRegistration(clerk_id, training_id) {
        try {
            const query = `SELECT 1 FROM training_registration WHERE clerk_id = $1 AND training_id = $2`;
            const values = [clerk_id, training_id];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to check registration: ", error);
            throw error;
        }
    }

    static async updateVacancies(trainingid) {
        try {
            const query = `UPDATE training_programs SET vacancies = vacancies -1, updated_at = NOW()
            WHERE id = $1 AND vacancies > 0 RETURNING *`;
            const result = await pool.query(query, [trainingid]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to update vacancies: ", error);
            throw error;
        }
    }

    static async getTrainingRegByUser(clerkid) {
        try {
            const query = `
                SELECT 
                    training_registration.id,
                    training_registration.clerk_id,
                    training_registration.training_id,
                    training_registration.status AS registration_status,
                    training_registration.registered_at,
                    training_programs.title,
                    training_programs.company_id,
                    training_programs.description,
                    training_programs.prerequisites,
                    training_programs.location,
                    training_programs.date,
                    training_programs.time,
                    training_programs.duration,
                    training_programs.meeting_url,
                    training_programs.is_public,
                    training_programs.status AS program_status,
                    training_programs.expected_outcome,
                    company_profiles.company_name,
                    company_profiles.website
                FROM training_registration
                LEFT JOIN training_programs ON training_programs.id = training_registration.training_id
                LEFT JOIN company_profiles ON company_profiles.company_id = training_programs.company_id
                WHERE training_registration.clerk_id = $1
                ORDER BY training_registration.registered_at DESC
            `;

            const result = await pool.query(query, [clerkid]);
            return result.rows;
        } catch (error) {
            logger.error("[MODEL] Failed to get training registrations");
            throw error;
        }
    }

    static async getCompanyTrainingPrograms(company_id) {
        try {
            const query = `SELECT tp.*, COUNT(tr.id) AS registration_count 
            FROM training_programs tp
            LEFT JOIN training_registration tr ON tr.training_id = tp.id
            WHERE company_id = $1
            GROUP BY tp.id
            ORDER BY tp.created_at DESC
            `;
            const result = await pool.query(query, [company_id]);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to get company programs");
            throw error;
        }
    }

    static async createNewProgram(
        company_id,
        title,
        description,
        prerequisites,
        expected_outcome,
        location,
        date,
        time,
        duration,
        vacancies,
        meeting_url,
        is_public,
        application_deadline,
    ) {
        try {
            const query = `
            INSERT INTO training_programs(company_id, title, description, prerequisites, expected_outcome, location, date, time, duration,
            vacancies, meeting_url, is_public, application_deadline, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'open') RETURNING *
            `;

            const values = [
                company_id,
                title,
                description,
                prerequisites,
                expected_outcome,
                location,
                date,
                time,
                duration,
                vacancies,
                meeting_url,
                is_public,
                application_deadline,
            ];

            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to create new program");
            throw error;
        }
    }

    static async getProgramById(programid) {
        try {
            const query = `SELECT tp.*, COUNT(tr.id) AS registration_count FROM training_programs tp
            LEFT JOIN training_registration tr ON tr.training_id = tp.id
            WHERE tp.id = $1  GROUP BY tp.id`;
            const result = await pool.query(query, [programid]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to get company programs by id");
            throw error;
        }
    }

    static async updateProgramById(
        title,
        description,
        prerequisites,
        expected_outcome,
        location,
        date,
        time,
        duration,
        vacancies,
        is_public,
        application_deadline,
        status,
        id,
    ) {
        try {
            const query = `UPDATE training_programs SET title = $1, description = $2, prerequisites = $3, expected_outcome = $4,
            location = $5, date = $6, time = $7, duration = $8, vacancies = $9, is_public = $10, application_deadline = $11, status = $12,
            updated_at = NOW() WHERE id = $13 RETURNING *`;

            const values = [
                title,
                description,
                prerequisites,
                expected_outcome,
                location,
                date,
                time,
                duration,
                vacancies,
                is_public,
                application_deadline,
                status,
                id,
            ];

            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to update training program");
            throw error;
        }
    }

    static async deleteProgramById(programid) {
        try {
            const query = "DELETE FROM training_programs WHERE id = $1";
            await pool.query(query, [programid]);
        } catch (error) {
            logger.error("[MODEL] Failed to delete training program");
            throw error;
        }
    }

    static async getProgramRegistration(programid) {
        try {
            const query = `
            SELECT tr.* FROM training_programs tp
            LEFT JOIN training_registration tr ON tr.training_id = tp.id
            WHERE tp.id = $1 
            ORDER BY tr.registered_at DESC
            `;

            const result = await pool.query(query, [programid]);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to get program registration");
            throw error;
        }
    }
}

module.exports = Training;
