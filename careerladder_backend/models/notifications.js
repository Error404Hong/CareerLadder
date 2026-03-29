const pool = require("../config/database");
const logger = require("../utils/logger");

class Notifications {
    static async createNotification(recipient_id, type, title, message, reference_type = null, reference_id = null) {
        try {
            const query = `
                INSERT INTO notifications (recipient_id, type, title, message, reference_type, reference_id)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            const values = [recipient_id, type, title, message, reference_type, reference_id];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to create notification: ", error);
            throw error;
        }
    }

    static async getNotifications(recipient_id) {
        try {
            const query = `
                SELECT * FROM notifications
                WHERE recipient_id = $1
                ORDER BY is_read ASC, created_at DESC
                LIMIT 10
            `;
            const result = await pool.query(query, [recipient_id]);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to fetch notifications: ", error);
            throw error;
        }
    }

    static async getUnreadCount(recipient_id) {
        try {
            const query = `
                SELECT COUNT(*) AS unread_count FROM notifications
                WHERE recipient_id = $1 AND is_read = FALSE
            `;
            const result = await pool.query(query, [recipient_id]);
            return parseInt(result.rows[0].unread_count) ?? 0;
        } catch (error) {
            logger.error("[MODEL] Failed to fetch unread count: ", error);
            throw error;
        }
    }

    static async markAsRead(id, recipient_id) {
        try {
            const query = `
                UPDATE notifications SET is_read = TRUE
                WHERE id = $1 AND recipient_id = $2
                RETURNING *
            `;
            const result = await pool.query(query, [id, recipient_id]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to mark notification as read: ", error);
            throw error;
        }
    }

    static async markAllAsRead(recipient_id) {
        try {
            const query = `
                UPDATE notifications SET is_read = TRUE
                WHERE recipient_id = $1 AND is_read = FALSE
            `;
            await pool.query(query, [recipient_id]);
        } catch (error) {
            logger.error("[MODEL] Failed to mark all notifications as read: ", error);
            throw error;
        }
    }

    static async deleteByReference(reference_type, reference_id) {
        try {
            const query = `
                DELETE FROM notifications
                WHERE reference_type = $1 AND reference_id = $2
            `;
            await pool.query(query, [reference_type, reference_id]);
        } catch (error) {
            logger.error("[MODEL] Failed to delete notifications by reference: ", error);
            throw error;
        }
    }
}

module.exports = Notifications;
