const pool = require("../config/database");
const logger = require("../utils/logger");

class Withdrawal {
    static async getAvailableBalance(studentid) {
        try {
            const query = `
            SELECT
                COALESCE(SUM(pr.amount_released), 0)
                    - COALESCE((SELECT SUM(w.amount) FROM withdrawals w
                                WHERE w.student_id = $1 AND w.status IN ('pending', 'approved', 'completed')), 0)
                AS available_balance
            FROM payment_releases pr
            JOIN project_payments pp ON pr.payment_id = pp.id
            WHERE pp.student_id = $1;
            `;
            const result = await pool.query(query, [studentid]);
            return result.rows[0].available_balance ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to get student available balance");
            throw error;
        }
    }

    static async requestWithdrawal(bank_id, amount, student_id) {
        try {
            const query = `
            INSERT INTO withdrawals(bank_id, amount, student_id)
            VALUES($1, $2, $3) RETURNING *
            `;

            const values = [bank_id, amount, student_id];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to request withdrawal");
            throw error;
        }
    }

    static async getWithdrawalRequestByStudent(student_id) {
        try {
            const query = `
            SELECT w.*, s.bank_name, s.account_number, s.account_holder_name
            FROM withdrawals w
            LEFT JOIN student_bank_accounts s ON s.id = w.bank_id
            WHERE w.student_id = $1
            ORDER BY w.requested_at DESC
            `;
            const result = await pool.query(query, [student_id]);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to get withdrawal request");
            throw error;
        }
    }

    static async getAllWithdrawalRequest() {
        try {
            const query = `
            SELECT w.*, s.bank_name, s.account_number, s.account_holder_name
            FROM withdrawals w
            LEFT JOIN student_bank_accounts s ON s.id = w.bank_id
            ORDER BY w.requested_at DESC
            `;
            const result = await pool.query(query);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to get all withdrawal request");
            throw error;
        }
    }

    static async approveRequest(id) {
        try {
            const query = `
            UPDATE withdrawals SET status = 'approved', reviewed_at = NOW()
            WHERE id = $1 RETURNING *
            `;

            const result = await pool.query(query, [id]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to approve withdrawal request");
            throw error;
        }
    }

    static async rejectRequest(note, id) {
        try {
            const query = `
            UPDATE withdrawals 
                SET status = 'rejected', 
                admin_note = $1,
                reviewed_at = NOW()
            WHERE id = $2 RETURNING *
            `;

            const result = await pool.query(query, [note, id]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to reject withdrawal request");
            throw error;
        }
    }

    static async completeRequest(id) {
        try {
            const query = `
            UPDATE withdrawals SET status = 'completed', completed_at = NOW()
            WHERE id = $1 RETURNING *
            `;

            const result = await pool.query(query, [id]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to complete withdrawal request");
            throw error;
        }
    }
}

module.exports = Withdrawal;
