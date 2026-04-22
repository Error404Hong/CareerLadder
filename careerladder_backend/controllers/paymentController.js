const Payment = require("../models/payment");
const sendResponse = require("../utils/responseHelper");
const logger = require("../utils/logger");
const { clerkClient } = require("@clerk/express");
const stripe = require("../config/stripe");

const createCheckoutSession = async (req, res) => {
    const {
        clerkid,
        amount,
        description,
        payment_type,
        project_id,
        application_id,
    } = req.body;

    let success_url, cancel_url;
    const base = process.env.FRONTEND_URL;

    if (payment_type === "project") {
        const path = `${base}/project-listings/view/${project_id}/applications/${application_id}/payment`;
        success_url = `${path}/success?status=success&session_id={CHECKOUT_SESSION_ID}`;
        cancel_url = `${path}/cancel?status=cancel`;
    }

    if (payment_type === "allowance_payment") {
        const path = `${base}/finance/payment`;
        success_url = `${path}?status=success&session_id={CHECKOUT_SESSION_ID}`;
        cancel_url = `${path}?status=cancel`;
    }

    try {
        const session = await Payment.createCheckoutSession(
            clerkid,
            amount,
            description,
            success_url,
            cancel_url,
            application_id,
            project_id,
            payment_type,
        );
        return sendResponse(res, 200, "Checkout session created", {
            url: session.url,
        });
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to create checkout session: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to create checkout session", {
            error: error.message,
        });
    }
};

const createProjectPayment = async (req, res) => {
    const {
        application_id,
        project_id,
        company_id,
        student_id,
        total_amount,
        monthly_allowance,
        duration_months,
    } = req.body;

    if (!application_id)
        return sendResponse(res, 400, "Application ID is required");
    if (!project_id) return sendResponse(res, 400, "Project ID is required");
    if (!company_id) return sendResponse(res, 400, "Company ID is required");
    if (!student_id) return sendResponse(res, 400, "Student ID is required");
    if (!total_amount)
        return sendResponse(res, 400, "Total amount is required");

    try {
        const result = await Payment.createProjectPayment(
            application_id,
            project_id,
            company_id,
            student_id,
            total_amount,
            monthly_allowance,
            duration_months,
        );
        if (!result)
            return sendResponse(res, 400, "Failed to create payment record");
        return sendResponse(
            res,
            200,
            "Payment record created successfully",
            result,
        );
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to create project payment: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to create payment record", {
            error: error.message,
        });
    }
};

const handleWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET,
        );
    } catch (error) {
        logger.error(
            "[WEBHOOK] Signature verification failed: ",
            error.message,
        );
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const { payment_type, applicationid, projectid } = session.metadata;

        try {
            if (payment_type === "project") {
                await Payment.confirmProjectPayment(
                    session.payment_intent,
                    session.id,
                    projectid,
                );
            } else if (payment_type === "allowance_payment") {
                await Payment.confirmAllowancePayment(
                    session.payment_intent,
                    session.id,
                    projectid,
                    applicationid,
                );
            }

            logger.info(`[WEBHOOK] Payment updated for session: ${session.id}`);
        } catch (error) {
            logger.error("[WEBHOOK] Failed to update payment: ", error.message);
        }
    }

    return res.status(200).json({ received: true });
};

const calculatePayable = async (req, res) => {
    const { projectid } = req.params;

    if (!projectid) return sendResponse(res, 400, "Project id is required");

    try {
        const result = await Payment.calculatePayable(projectid);
        return sendResponse(res, 200, "Calculated Successfully", result);
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to calculate total payable: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to calculate total payable", {
            error: error.message,
        });
    }
};

const getPaymentsByCompany = async (req, res) => {
    const { companyId } = req.params;
    if (!companyId) return sendResponse(res, 400, "Company ID is required");

    try {
        const payments = await Payment.getPaymentsByCompany(companyId);

        const enriched = await Promise.all(
            payments.map(async (payment) => {
                try {
                    const student = await clerkClient.users.getUser(
                        payment.student_id,
                    );
                    return {
                        ...payment,
                        student_name: `${student.firstName} ${student.lastName}`,
                        student_email:
                            student.emailAddresses[0]?.emailAddress ?? "",
                        student_image: student.imageUrl,
                    };
                } catch {
                    return {
                        ...payment,
                        student_name: null,
                        student_email: null,
                        student_image: null,
                    };
                }
            }),
        );

        return sendResponse(
            res,
            200,
            "Payments fetched successfully",
            enriched,
        );
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to get payments by company: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to get payments", {
            error: error.message,
        });
    }
};

const getPaymentStats = async (req, res) => {
    const { companyId } = req.params;
    if (!companyId) return sendResponse(res, 400, "Company ID is required");

    try {
        const stats = await Payment.getPaymentStats(companyId);
        return sendResponse(
            res,
            200,
            "Payment stats fetched successfully",
            stats,
        );
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to get payment stats: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to get payment stats", {
            error: error.message,
        });
    }
};

const getPaymentsByStudent = async (req, res) => {
    const { studentId } = req.params;
    if (!studentId) return sendResponse(res, 400, "Student ID is required");

    try {
        const payments = await Payment.getPaymentsByStudent(studentId);
        return sendResponse(
            res,
            200,
            "Payments fetched successfully",
            payments,
        );
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to get payments by student: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to get payments", {
            error: error.message,
        });
    }
};

const updatePaymentStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!id) return sendResponse(res, 400, "Payment ID is required");
    if (!status) return sendResponse(res, 400, "Status is required");

    try {
        const result = await Payment.updatePaymentStatus(id, status);
        if (!result)
            return sendResponse(res, 400, "Failed to update payment status");
        return sendResponse(
            res,
            200,
            "Payment status updated successfully",
            result,
        );
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to update payment status: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to update payment status", {
            error: error.message,
        });
    }
};

const releaseMonthlyPayment = async (req, res) => {
    const { id } = req.params;
    if (!id) return sendResponse(res, 400, "Payment id is required");

    try {
        const result = await Payment.releaseMonthlyPayment(id);
        return sendResponse(res, 200, "Monthly payment released", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to release payment");
        return sendResponse(res, 500, "Failed to release payment", {
            error: error.message,
        });
    }
};

const getPaymentReleases = async (req, res) => {
    const { paymentId } = req.params;
    const id = paymentId;
    if (!id) return sendResponse(res, 400, "Payment id is required");

    try {
        const result = await Payment.getPaymentReleases(id);
        return sendResponse(res, 200, "Payment releases fetched", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to fetch payment releases");
        return sendResponse(res, 500, "Failed to fetch payment releases", {
            error: error.message,
        });
    }
};

module.exports = {
    createCheckoutSession,
    handleWebhook,
    createProjectPayment,
    calculatePayable,
    getPaymentsByCompany,
    getPaymentStats,
    getPaymentsByStudent,
    updatePaymentStatus,
    releaseMonthlyPayment,
    getPaymentReleases,
};
