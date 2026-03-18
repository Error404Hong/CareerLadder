const Training = require("../models/training");
const sendResponse = require("../utils/responseHelper");
const logger = require("../utils/logger");

const getAllTrainingPrograms = async (req, res) => {
    try {
        const result = await Training.getAllTrainingPrograms();

        if (!result)
            return sendResponse(res, 404, "Failed to fetch training programs");

        return sendResponse(
            res,
            200,
            "Traning programs fetched successfully",
            result,
        );
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to fetch training programs: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to fetch training programs", {
            error: error.message,
        });
    }
};

const registerTraining = async (req, res) => {
    const { clerkid, trainingid } = req.body;

    if (!clerkid) return sendResponse(res, 400, "User ID is required");
    if (!trainingid) return sendResponse(res, 400, "Training ID is required");

    try {
        const existing = await Training.checkRegistration(clerkid, trainingid);
        if (existing)
            return sendResponse(
                res,
                200,
                "You have already registered for this training",
            );

        const result = await Training.registerTraining(clerkid, trainingid);
        if (!result)
            return sendResponse(res, 400, "Failed to register for training");

        return sendResponse(res, 200, "Registered successfully", result);
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to register training: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to register for training", {
            error: error.message,
        });
    }
};

module.exports = { getAllTrainingPrograms, registerTraining };
