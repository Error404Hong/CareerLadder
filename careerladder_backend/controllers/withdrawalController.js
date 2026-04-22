const Withdrawal = require("../models/withdrawal");
const sendResponse = require("../utils/responseHelper");
const logger = require("../utils/logger");

const getAvailableBalance = async (req, res) => {
    const { studentid } = req.params;
    if (!studentid) return sendResponse(res, 400, "Student ID is required");

    try {
        const result = await Withdrawal.getAvailableBalance(studentid);
        return sendResponse(res, 200, "Fetched available balance", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to get available balance: ", error);
        return sendResponse(res, 500, "Failed to get available balance", {
            error: error.message,
        });
    }
};

const requestWithdrawal = async (req, res) => {
    const { bankid, studentid } = req.params;
    const { amount } = req.body;

    if (!bankid || !studentid)
        return sendResponse(res, 400, "Missing required IDs");

    if (Number(amount) <= 0)
        return sendResponse(
            res,
            400,
            "Withdrawal amount cannot be less than or equal to 0",
        );

    try {
        const balance = await Withdrawal.getAvailableBalance(studentid);
        if (Number(balance) < Number(amount)) {
            return sendResponse(res, 400, "Insufficient withdrawal balance");
        }

        const result = await Withdrawal.requestWithdrawal(
            bankid,
            amount,
            studentid,
        );
        return sendResponse(res, 200, "Withdrawal request sent", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to request withdrawal: ", error);
        return sendResponse(res, 500, "Failed to request withdrawal", {
            error: error.message,
        });
    }
};

const getWithdrawalRequestByStudent = async (req, res) => {
    const { studentid } = req.params;
    if (!studentid) return sendResponse(res, 400, "Student ID is required");

    try {
        const result =
            await Withdrawal.getWithdrawalRequestByStudent(studentid);
        return sendResponse(res, 200, "Withdrawal record fetched", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to get withdrawal record: ", error);
        return sendResponse(res, 500, "Failed to get withdrawal record", {
            error: error.message,
        });
    }
};

const getAllWithdrawalRequest = async (req, res) => {
    try {
        const result = await Withdrawal.getAllWithdrawalRequest();
        return sendResponse(res, 200, "All withdrawal record fetched", result);
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to get all withdrawal record: ",
            error,
        );
        return sendResponse(res, 500, "Failed to get all withdrawal record", {
            error: error.message,
        });
    }
};

const approveRequest = async (req, res) => {
    const { id } = req.params;
    if (!id) return sendResponse(res, 400, "ID is required");

    try {
        const result = await Withdrawal.approveRequest(id);
        return sendResponse(res, 200, "Approved record", result);
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to approve withdrawal request: ",
            error,
        );
        return sendResponse(res, 500, " Failed to approve withdrawal request", {
            error: error.message,
        });
    }
};

const rejectRequest = async (req, res) => {
    const { id } = req.params;
    const { note } = req.body;
    if (!id) return sendResponse(res, 400, "ID is required");

    try {
        const result = await Withdrawal.rejectRequest(note, id);
        return sendResponse(res, 200, "Rejected record", result);
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to reject withdrawal request: ",
            error,
        );
        return sendResponse(res, 500, " Failed to reject withdrawal request", {
            error: error.message,
        });
    }
};

const completeRequest = async (req, res) => {
    const { id } = req.params;
    if (!id) return sendResponse(res, 400, "ID is required");

    try {
        const result = await Withdrawal.completeRequest(id);
        return sendResponse(res, 200, "Complete record", result);
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to complete withdrawal request: ",
            error,
        );
        return sendResponse(
            res,
            500,
            " Failed to complete withdrawal request",
            {
                error: error.message,
            },
        );
    }
};

module.exports = {
    getAvailableBalance,
    requestWithdrawal,
    getWithdrawalRequestByStudent,
    getAllWithdrawalRequest,
    approveRequest,
    rejectRequest,
    completeRequest,
};
