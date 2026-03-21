const Payment = require("../models/payment");
const sendResponse = require("../utils/responseHelper");
const logger = require("../utils/logger");

const createCheckoutSession = async (req, res) => {
    const { clerkid, amount, description } = req.body;

    if (!clerkid) return sendResponse(res, 400, "User ID is required");
    if (!amount) return sendResponse(res, 400, "Amount is required");

    try {
        const session = await Payment.createCheckoutSession(
            clerkid,
            amount,
            description,
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

module.exports = { createCheckoutSession };
