const stripe = require("../config/stripe");
const pool = require("../config/database");
const logger = require("../utils/logger");

class Payment {
    static async createCheckoutSession(clerkid, amount, description, project_id, application_id) {
        try {
            const base = `${process.env.FRONTEND_URL}/project-listings/view/${project_id}/applications/${application_id}/payment`;
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
                success_url: `${base}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${base}/cancel`,
                metadata: { clerkid },
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
}

module.exports = Payment;
