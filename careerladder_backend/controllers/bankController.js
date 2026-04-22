const Bank = require("../models/bank");
const sendResponse = require("../utils/responseHelper");
const logger = require("../utils/logger");

const getBankAccounts = async (req, res) => {
    const { studentid } = req.params;
    if (!studentid) return sendResponse(res, 400, "Student ID is required");

    try {
        const result = await Bank.getBankAccounts(studentid);
        return sendResponse(res, 200, "Student bank acc fetched", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to get student bank acc: ", error);
        return sendResponse(res, 500, "Failed to get student bank acc", {
            error: error.message,
        });
    }
};

const addBankAccount = async (req, res) => {
    const { studentid } = req.params;
    if (!studentid) return sendResponse(res, 400, "Student ID is required");

    const { bank_name, account_number, account_holder_name, is_default } =
        req.body;

    try {
        const result = await Bank.addBankAccount(
            studentid,
            bank_name,
            account_number,
            account_holder_name,
            is_default,
        );
        return sendResponse(res, 200, "Bank added successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to add bank acc: ", error);
        return sendResponse(res, 500, "Failed to add bank acc", {
            error: error.message,
        });
    }
};

const deleteBankAccount = async (req, res) => {
    const { id, studentid } = req.params;
    if (!id || !studentid)
        return sendResponse(res, 400, "Missing required IDs");

    try {
        const result = await Bank.deleteBankAccount(id, studentid);
        return sendResponse(res, 200, "Bank account deleted", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to delete bank acc: ", error);
        return sendResponse(res, 500, "Failed to delete bank acc", {
            error: error.message,
        });
    }
};

const setDefault = async (req, res) => {
    const { id, studentid } = req.params;
    if (!id || !studentid)
        return sendResponse(res, 400, "Missing required IDs");

    try {
        const result = await Bank.setDefault(id, studentid);
        return sendResponse(res, 200, "Bank account set as default", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to set default bank: ", error);
        return sendResponse(res, 500, "Failed to set default bank", {
            error: error.message,
        });
    }
};

module.exports = {
    getBankAccounts,
    addBankAccount,
    deleteBankAccount,
    setDefault,
};
