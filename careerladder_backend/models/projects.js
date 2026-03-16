const pool = require("../config/database");
const logger = require("../utils/logger");

class Projects {
    static async getAllProjects() {
        try {
            const query = "SELECT * FROM projects WHERE status = 'open'";
            const result = await pool.query(query);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to fetch all projects");
            throw error;
        }
    }
}

module.exports = Projects;
