const pool = require("../config/database");
const logger = require("../utils/logger");

class Bank {
    static async getBankAccounts(studentid) {
        try {
            const query = "SELECT * FROM student_bank_accounts WHERE student_id = $1";
            const result = await pool.query(query, [studentid]);
            return result.rows ?? [];
        } catch (error) {
            logger.error(
                "[MODEL] Failed to get student bank accounts: ",
                error,
            );
            throw error;
        }
    }

    static async addBankAccount(
        student_id,
        bank_name,
        account_number,
        account_holder_name,
        is_default,
    ) {
        try {
            const query = `
                INSERT INTO student_bank_accounts(student_id, bank_name, account_number, account_holder_name, is_default)
                VALUES($1, $2, $3, $4, $5) RETURNING * 
            `;

            const values = [
                student_id,
                bank_name,
                account_number,
                account_holder_name,
                is_default,
            ];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to add bank accounts: ", error);
            throw error;
        }
    }

    static async deleteBankAccount(id, student_id) {
        try {
            const query =
                "DELETE FROM student_bank_accounts WHERE id = $1 AND student_id = $2 RETURNING *";
            const values = [id, student_id];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to delete bank accounts: ", error);
            throw error;
        }
    }

    static async setDefault(id, student_id) {
        try {
            const updateFalseQuery =
                "UPDATE student_bank_accounts SET is_default = false WHERE student_id = $1 RETURNING *";
            const updFalseResult = await pool.query(updateFalseQuery, [
                student_id,
            ]);

            if (updFalseResult) {
                const query =
                    "UPDATE student_bank_accounts SET is_default = true WHERE id = $1 AND student_id = $2";
                const values = [id, student_id];
                const result = await pool.query(query, values);
                return result.rows[0] ?? null;
            }
        } catch (error) {
            logger.error("[MODEL] Failed to set bank as default: ", error);
            throw error;
        }
    }
}

module.exports = Bank;
