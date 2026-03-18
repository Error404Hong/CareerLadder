const pool = require("../config/database");
const logger = require("../utils/logger");

class Training {
    static async getAllTrainingPrograms() {
        try {
            const query =
                "SELECT * FROM training_programs WHERE status = 'open' OR status = 'ongoing'";
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
}

module.exports = Training;
