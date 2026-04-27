const pool = require("../config/database");
const logger = require("../utils/logger");

class Rewards {
    static async getBadges() {
        try {
            const query = "SELECT * FROM badges ORDER BY created_at DESC";
            const result = await pool.query(query);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to get all badges: ", error);
            throw error;
        }
    }

    static async addBadge(name, description, icon) {
        try {
            const query =
                "INSERT INTO badges(name, description, icon) VALUES($1, $2, $3) RETURNING *";
            const values = [name, description, icon];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to add badge: ", error);
            throw error;
        }
    }

    static async deleteBadge(badgeId) {
        try {
            const query = "DELETE FROM badges WHERE id = $1 RETURNING *";
            const result = await pool.query(query, [badgeId]);
            return result.rows[0] ?? null;
        } catch (error) {
            console.log("[MODEL] Failed to delete badge: ", error);
            throw error;
        }
    }

    static async updateBadge(name, description, icon, badgeId) {
        try {
            const query = `
            UPDATE badges SET name = $1, description = $2, icon = $3
            WHERE id = $4
            RETURNING *
            `;
            const values = [name, description, icon, badgeId];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            console.log("[MODEL] Failed to update badge: ", error);
            throw error;
        }
    }

    static async getBadgesByStudent(studentId) {
        try {
            const query = `
            SELECT sb.*, p.title, u.company_name, 
            b.name, b.description, b.icon 
            FROM student_badges sb
            LEFT JOIN projects p ON p.id = sb.project_id
            LEFT JOIN company_profiles u ON u.company_id = sb.awarded_by
            LEFT JOIN badges b ON b.id = sb.badge_id
            WHERE sb.student_id = $1 
            ORDER BY sb.awarded_at DESC
            `;

            const result = await pool.query(query, [studentId]);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to get student badge: ", error);
            throw error;
        }
    }

    static async awardBadge(studentId, badgeId, projectId, awardedBy) {
        try {
            const query = `
            INSERT INTO student_badges(student_id, badge_id, project_id, awarded_by)
            VALUES($1, $2, $3, $4)
            ON CONFLICT (student_id, badge_id, project_id) DO NOTHING
            RETURNING *
            `;

            const values = [studentId, badgeId, projectId, awardedBy];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            console.log("[MODEL] Failed to award badge: ", error);
            throw error;
        }
    }

    static async issueCertification(
        studentId,
        projectId,
        employerId,
        certificationURL,
    ) {
        try {
            const query = `
            INSERT INTO certifications(student_id, project_id, employer_id, certification_url) 
            VALUES($1, $2, $3, $4) RETURNING *
            `;
            const values = [studentId, projectId, employerId, certificationURL];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to issue cert: ", error);
            throw error;
        }
    }

    static async getStudentCertifications(studentId) {
        try {
            const query = ` 
            SELECT c.*, p.title, cp.company_name FROM certifications c
            LEFT JOIN projects p ON p.id = c.project_id
            LEFT JOIN company_profiles cp ON cp.company_id = c.employer_id
            WHERE c.student_id = $1 
            ORDER BY c.issued_at DESC
            `;
            const result = await pool.query(query, [studentId]);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to get student cert: ", error);
            throw error;
        }
    }

    static async awardExperiencePoints(expPoints, studentId) {
        try {
            const query = `
            UPDATE student_profiles 
            SET experience_points = experience_points + $1
            WHERE clerk_id = $2 RETURNING *
            `;

            const values = [expPoints, studentId];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to award points: ", error);
            throw error;
        }
    }

    static async getStudentExpPoints(studentId) {
        try {
            const query =
                "SELECT experience_points FROM student_profiles WHERE clerk_id = $1";
            const result = await pool.query(query, [studentId]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to get student points: ", error);
            throw error;
        }
    }
}

module.exports = Rewards;
