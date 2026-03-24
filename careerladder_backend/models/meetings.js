const pool = require("../config/database");
const logger = require("../utils/logger");

class Meetings {
    static async scheduleMeeting(
        application_id,
        company_id,
        applicant_id,
        meeting_url,
        room_name,
        title,
        description,
        meeting_type,
        reference_type,
        reference_id,
        scheduled_at,
        duration,
    ) {
        try {
            const query = `
                INSERT INTO meetings(
                    application_id, company_id, applicant_id,
                    meeting_url, room_name, title, description,
                    meeting_type, reference_type, reference_id,
                    scheduled_at, duration
                )
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING *
            `;
            const values = [
                application_id,
                company_id,
                applicant_id,
                meeting_url,
                room_name,
                title,
                description,
                meeting_type,
                reference_type,
                reference_id,
                scheduled_at,
                duration,
            ];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to schedule meeting: ", error);
            throw error;
        }
    }

    static async getMeetingByApplication(application_id) {
        try {
            const query = `SELECT * FROM meetings WHERE application_id = $1 ORDER BY scheduled_at DESC`;
            const result = await pool.query(query, [application_id]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error(
                "[MODEL] Failed to get meeting by application: ",
                error,
            );
            throw error;
        }
    }

    static async getMeetingsByCompany(company_id) {
        try {
            const query = `SELECT * FROM meetings WHERE company_id = $1 ORDER BY scheduled_at DESC`;
            const result = await pool.query(query, [company_id]);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to get meetings by company: ", error);
            throw error;
        }
    }

    static async getMeetingsByApplicant(applicant_id) {
        try {
            const query = `SELECT * FROM meetings WHERE applicant_id = $1 ORDER BY scheduled_at DESC`;
            const result = await pool.query(query, [applicant_id]);
            return result.rows ?? [];
        } catch (error) {
            logger.error(
                "[MODEL] Failed to get meetings by applicant: ",
                error,
            );
            throw error;
        }
    }

    static async updateMeetingStatus(id, status) {
        try {
            const query = `UPDATE meetings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`;
            const result = await pool.query(query, [status, id]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to update meeting status: ", error);
            throw error;
        }
    }

    static async deleteMeeting(id) {
        try {
            const query = `DELETE FROM meetings WHERE id = $1 RETURNING *`;
            const result = await pool.query(query, [id]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to delete meeting: ", error);
            throw error;
        }
    }
}

module.exports = Meetings;
