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
            const query = `
            SELECT
                meetings.*,
                CASE
                    WHEN meetings.reference_type = 'job' THEN jobs.title
                    WHEN meetings.reference_type = 'project' THEN projects.title
                    ELSE NULL
                END AS reference_title,
                sp.major,
                sp.location AS applicant_location
            FROM meetings
            LEFT JOIN jobs ON jobs.id = meetings.reference_id::uuid AND meetings.reference_type = 'job'
            LEFT JOIN projects ON projects.id = meetings.reference_id::uuid AND meetings.reference_type = 'project'
            LEFT JOIN student_profiles sp ON sp.clerk_id = meetings.applicant_id
            WHERE meetings.company_id = $1
            ORDER BY meetings.scheduled_at ASC
        `;
            const result = await pool.query(query, [company_id]);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to get meetings by company: ", error);
            throw error;
        }
    }

    static async getMeetingsByApplicant(applicant_id) {
        try {
            const query = `
            SELECT
                meetings.*,
                CASE
                    WHEN meetings.reference_type = 'job' THEN jobs.title
                    WHEN meetings.reference_type = 'project' THEN projects.title
                    ELSE NULL
                END AS reference_title,
                company_profiles.company_name,
                company_profiles.company_id
            FROM meetings
            LEFT JOIN jobs ON jobs.id = meetings.reference_id::uuid AND meetings.reference_type = 'job'
            LEFT JOIN projects ON projects.id = meetings.reference_id::uuid AND meetings.reference_type = 'project'
            LEFT JOIN company_profiles ON company_profiles.company_id = meetings.company_id
            WHERE meetings.applicant_id = $1
            ORDER BY meetings.scheduled_at ASC
        `;
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

    static async rescheduleMeeting(
        id,
        title,
        description,
        meeting_url,
        room_name,
        scheduled_at,
        duration,
    ) {
        try {
            const query = `
                UPDATE meetings
                SET title = $1, description = $2, meeting_url = $3, room_name = $4,
                    scheduled_at = $5, duration = $6, status = 'scheduled', updated_at = NOW()
                WHERE id = $7
                RETURNING *
            `;
            const values = [
                title,
                description,
                meeting_url,
                room_name,
                scheduled_at,
                duration,
                id,
            ];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            console.log("[MODEL] Failed to reschedule meeting: ", error);
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

    static async getMeetingByRoomName(room_name) {
        try {
            const query = `
            SELECT
                meetings.*,
                CASE
                    WHEN meetings.reference_type = 'job' THEN jobs.title
                    WHEN meetings.reference_type = 'project' THEN projects.title
                    ELSE NULL
                END AS reference_title
            FROM meetings
            LEFT JOIN jobs ON jobs.id = meetings.reference_id::uuid AND meetings.reference_type = 'job'
            LEFT JOIN projects ON projects.id = meetings.reference_id::uuid AND meetings.reference_type = 'project'
            WHERE meetings.room_name = $1
        `;
            const result = await pool.query(query, [room_name]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to get meeting by room name: ", error);
            throw error;
        }
    }

    static async getApplicantMeetingById(
        reference_id,
        reference_type,
        applicant_id,
    ) {
        try {
            const query = `
            SELECT * FROM meetings
            WHERE reference_id = $1 AND reference_type = $2
            AND applicant_id = $3
            ORDER BY created_at DESC
            `;

            const values = [reference_id, reference_type, applicant_id];
            const result = await pool.query(query, values);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to get applicant meeting by id");
            throw error;
        }
    }
}

module.exports = Meetings;
