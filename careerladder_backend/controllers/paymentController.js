const Payment = require("../models/payment");
const sendResponse = require("../utils/responseHelper");
const logger = require("../utils/logger");

const createCheckoutSession = async (req, res) => {
    const { clerkid, amount, description, project_id, application_id } = req.body;

    if (!clerkid) return sendResponse(res, 400, "User ID is required");
    if (!amount) return sendResponse(res, 400, "Amount is required");
    if (!project_id) return sendResponse(res, 400, "Project ID is required");
    if (!application_id) return sendResponse(res, 400, "Application ID is required");

    try {
        const session = await Payment.createCheckoutSession(
            clerkid,
            amount,
            description,
            project_id,
            application_id,
        );

        return sendResponse(res, 200, "Checkout session created", {
            url: session.url,
        });
    } catch (error) {
        logger.error("[CONTROLLER] Failed to create checkout session");
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

module.exports = {
    createCheckoutSession,
    createProjectPayment,
    calculatePayable,
};
