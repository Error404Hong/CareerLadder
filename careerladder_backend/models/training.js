const pool = require("../config/database");
const logger = require("../utils/logger");

class Training {
    static async getAllTrainingPrograms() {
        try {
            const query =
                "SELECT * FROM training_programs WHERE status = 'open' OR status = 'ongoing' ORDER BY created_at DESC";
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
                    training_programs.expected_outcome
                FROM training_registration
                LEFT JOIN training_programs ON training_programs.id = training_registration.training_id
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
}

module.exports = Training;
