const stripe = require("../config/stripe");
const pool = require("../config/database");
const logger = require("../utils/logger");

class Payment {
    static async createCheckoutSession(
        clerkid,
        amount,
        description,
        success_url,
        cancel_url,
        applicationid,
        projectid,
        payment_type,
    ) {
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card", "fpx"],
                line_items: [
                    {
                        price_data: {
                            currency: "myr",
                            product_data: {
                                name: description,
                            },
                            unit_amount: amount * 100,
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                success_url,
                cancel_url,
                metadata: { clerkid, applicationid, projectid, payment_type },
            });
            return session;
        } catch (error) {
            throw error;
        }
    }

    static async createProjectPayment(
        application_id,
        project_id,
        company_id,
        student_id,
        total_amount,
        monthly_allowance,
        duration_months,
    ) {
        try {
            const query = `
            INSERT INTO project_payments(
                application_id, project_id, company_id, student_id,
                total_amount, remaining_amount, monthly_allowance, duration_months
            )
            VALUES($1, $2, $3, $4, $5, $5, $6, $7)
            RETURNING *
        `;
            const values = [
                application_id,
                project_id,
                company_id,
                student_id,
                total_amount,
                monthly_allowance,
                duration_months,
            ];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to create project payment: ", error);
            throw error;
        }
    }

    static async calculatePayable(projectid) {
        try {
            const query = `
            SELECT 
                project_id,
                COUNT(application_id) AS total_vacancies
            FROM project_payments
            WHERE project_id = $1
            GROUP BY project_id
             `;

            const result = await pool.query(query, [projectid]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to calculate total payable: ", error);
            throw error;
        }
    }

    static async getPaymentsByCompany(company_id) {
        try {
            const query = `
                SELECT
                    pp.*,
                    p.title AS project_title,
                    p.duration,
                    p.allowance
                FROM project_payments pp
                LEFT JOIN projects p ON p.id = pp.project_id
                WHERE pp.company_id = $1
                ORDER BY pp.created_at DESC
            `;
            const result = await pool.query(query, [company_id]);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to get payments by company: ", error);
            throw error;
        }
    }

    static async getPaymentStats(company_id) {
        try {
            const query = `
                SELECT
                    COALESCE(SUM(total_amount), 0) AS total_spent,
                    COALESCE(SUM(total_amount) FILTER (WHERE status = 'pending'), 0) AS pending_amount,
                    COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
                    COALESCE(SUM(total_amount) FILTER (WHERE status = 'paid'), 0) AS escrow_amount,
                    COUNT(*) FILTER (WHERE status = 'paid') AS escrow_count,
                    COALESCE(SUM(total_amount) FILTER (WHERE status = 'completed'), 0) AS completed_amount,
                    COUNT(*) FILTER (WHERE status = 'completed') AS completed_count
                FROM project_payments
                WHERE company_id = $1
            `;
            const result = await pool.query(query, [company_id]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to get payment stats: ", error);
            throw error;
        }
    }

    static async getPaymentsByStudent(student_id) {
        try {
            const query = `
                SELECT
                    pp.*,
                    p.title AS project_title,
                    p.duration,
                    p.allowance,
                    cp.company_name
                FROM project_payments pp
                LEFT JOIN projects p ON p.id = pp.project_id
                LEFT JOIN company_profiles cp ON cp.company_id = pp.company_id
                WHERE pp.student_id = $1
                ORDER BY pp.created_at DESC
            `;
            const result = await pool.query(query, [student_id]);
            return result.rows ?? [];
        } catch (error) {
            logger.error("[MODEL] Failed to get payments by student: ", error);
            throw error;
        }
    }

    static async updatePaymentStatus(id, status) {
        try {
            const query = `
                UPDATE project_payments
                SET status = $1, updated_at = NOW()
                WHERE id = $2
                RETURNING *
            `;
            const result = await pool.query(query, [status, id]);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to update payment status: ", error);
            throw error;
        }
    }

    static async confirmAllowancePayment(
        stripe_payment_id,
        stripe_session_id,
        project_id,
        application_id,
    ) {
        try {
            const query = `
            UPDATE project_payments SET status = 'paid', 
            stripe_payment_id = $1, stripe_session_id = $2, updated_at = NOW(), paid_at = NOW()
            WHERE project_id = $3 AND application_id = $4 RETURNING *
            `;

            const values = [
                stripe_payment_id,
                stripe_session_id,
                project_id,
                application_id,
            ];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to confirm payment: ", error);
            throw error;
        }
    }

    static async confirmProjectPayment(
        stripe_payment_id,
        stripe_session_id,
        project_id,
    ) {
        try {
            const query = `
            UPDATE project_payments SET status = 'paid',
            stripe_payment_id = $1, stripe_session_id = $2, updated_at = NOW(), paid_at = NOW()
            WHERE project_id = $3 RETURNING *
            `;

            const values = [stripe_payment_id, stripe_session_id, project_id];
            const result = await pool.query(query, values);
            return result.rows[0] ?? null;
        } catch (error) {
            logger.error("[MODEL] Failed to confirm payment: ", error);
            throw error;
        }
    }

    static async releaseMonthlyPayment(id) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            // Calculate next month number
            const countRes = await client.query(
                "SELECT COUNT(*) AS cnt FROM payment_releases WHERE payment_id = $1",
                [id],
            );
            const monthNumber = parseInt(countRes.rows[0].cnt) + 1;

            // Update project_payments
            const updateRes = await client.query(
                `
                UPDATE project_payments
                SET
                    paid_amount       = paid_amount + monthly_allowance,
                    remaining_amount  = remaining_amount - monthly_allowance,
                    status = CASE
                        WHEN (remaining_amount - monthly_allowance) <= 0 THEN 'completed'
                        ELSE 'releasing'
                    END,
                    updated_at = NOW()
                WHERE id = $1
                AND status IN ('paid', 'releasing')
                AND remaining_amount > 0
                RETURNING *
            `,
                [id],
            );

            if (!updateRes.rows[0]) {
                await client.query("ROLLBACK");
                return null;
            }

            const payment = updateRes.rows[0];

            // Insert into payment_releases
            await client.query(
                `
            INSERT INTO payment_releases (payment_id, month_number, amount_released)
            VALUES ($1, $2, $3)
        `,
                [id, monthNumber, payment.monthly_allowance],
            );

            await client.query("COMMIT");
            return payment;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    static async getPaymentReleases(payment_id) {
        const result = await pool.query(
            "SELECT * FROM payment_releases WHERE payment_id = $1 ORDER BY month_number ASC",
            [payment_id],
        );
        return result.rows;
    }
}

module.exports = Payment;
