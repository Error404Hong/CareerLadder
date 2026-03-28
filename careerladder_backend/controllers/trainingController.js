const Training = require("../models/training");
const sendResponse = require("../utils/responseHelper");
const logger = require("../utils/logger");
const { clerkClient } = require("@clerk/express");

const getAllTrainingPrograms = async (req, res) => {
    try {
        const result = await Training.getAllTrainingPrograms();

        const enriched = await Promise.all(
            result.map(async (res) => {
                try {
                    const clerkUser = await clerkClient.users.getUser(
                        res.company_id,
                    );

                    return {
                        ...res,
                        company_logo_url: clerkUser.imageUrl,
                        company_email:
                            clerkUser.emailAddresses[0]?.emailAddress ?? "",
                    };
                } catch {
                    return {
                        ...res,
                        company_logo_url: null,
                        company_email: null,
                    };
                }
            }),
        );

        return sendResponse(
            res,
            200,
            "Traning programs fetched successfully",
            enriched,
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
        await Training.updateVacancies(trainingid);
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

const getTrainingRegByUser = async (req, res) => {
    const { clerkid } = req.params;

    if (!clerkid) return sendResponse(res, 400, "User ID is required");

    try {
        const result = await Training.getTrainingRegByUser(clerkid);

        const enriched = await Promise.all(
            result.map(async (res) => {
                try {
                    const clerkUser = await clerkClient.users.getUser(
                        res.company_id,
                    );

                    return {
                        ...res,
                        company_logo_url: clerkUser.imageUrl,
                        company_email:
                            clerkUser.emailAddresses[0]?.emailAddress ?? "",
                    };
                } catch {
                    return {
                        ...res,
                        company_logo_url: null,
                        company_email: null,
                    };
                }
            }),
        );

        return sendResponse(
            res,
            200,
            "Training registrations fetched successfully",
            enriched,
        );
    } catch (error) {
        logger.error("[CONTROLLER] Failed to get training registrations");
        return sendResponse(res, 500, "Failed to get training registrations", {
            error: error.message,
        });
    }
};

const getCompanyTrainingPrograms = async (req, res) => {
    const { companyid } = req.params;
    if (!companyid) return sendResponse(res, 400, "Company id is required");

    try {
        const result = await Training.getCompanyTrainingPrograms(companyid);
        return sendResponse(res, 200, "Company trainings fetched", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to get company trainings");
        return sendResponse(res, 500, "Failed to get company trainings", {
            error: error.message,
        });
    }
};

const createNewProgram = async (req, res) => {
    const {
        company_id,
        title,
        description,
        prerequisites,
        expected_outcome,
        location,
        date,
        time,
        duration,
        vacancies,
        is_public,
        application_deadline,
    } = req.body;

    if (!company_id) return sendResponse(res, 400, "Company id is required");

    try {
        const result = await Training.createNewProgram(
            company_id,
            title,
            description,
            prerequisites,
            expected_outcome,
            location,
            date,
            time,
            duration,
            vacancies,
            is_public,
            application_deadline,
        );

        return sendResponse(res, 200, "Training program created", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to create new training program");
        return sendResponse(res, 500, "Failed to create new training program", {
            error: error.message,
        });
    }
};

const getProgramById = async (req, res) => {
    const { programid } = req.params;
    if (!programid) return sendResponse(res, 400, "Program id is required");

    try {
        const result = await Training.getProgramById(programid);
        return sendResponse(res, 200, "Program fetched successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to fetch training program");
        return sendResponse(res, 500, "Failed to fetch training program", {
            error: error.message,
        });
    }
};

const updateProgramById = async (req, res) => {
    const { programid } = req.params;
    if (!programid) return sendResponse(res, 400, "Program id is required");

    const {
        title,
        description,
        prerequisites,
        expected_outcome,
        location,
        date,
        time,
        duration,
        vacancies,
        is_public,
        application_deadline,
        status,
    } = req.body;

    console.log("Body: ", req.body);

    try {
        const result = await Training.updateProgramById(
            title,
            description,
            prerequisites,
            expected_outcome,
            location,
            date,
            time,
            duration,
            vacancies,
            is_public,
            application_deadline,
            status,
            programid,
        );

        return sendResponse(res, 200, "Program updated", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to update training program");
        return sendResponse(res, 500, "Failed to update training program", {
            error: error.message,
        });
    }
};

const deleteProgramById = async (req, res) => {
    const { programid } = req.params;
    if (!programid) return sendResponse(res, 400, "Program id is required");

    try {
        await Training.deleteProgramById(programid);
        return sendResponse(res, 200, "Program deleted successfully");
    } catch (error) {
        logger.error("[CONTROLLER] Failed to delete training program");
        return sendResponse(res, 500, "Failed to delete training program", {
            error: error.message,
        });
    }
};

const getProgramRegistration = async (req, res) => {
    const { programid } = req.params;
    if (!programid) return sendResponse(res, 400, "Program id is required");

    try {
        const result = await Training.getProgramRegistration(programid);

        const enriched = await Promise.all(
            result.map(async (res) => {
                try {
                    const clerkUser = await clerkClient.users.getUser(
                        res.clerk_id,
                    );

                    return {
                        ...res,
                        firstName: clerkUser.firstName,
                        lastName: clerkUser.lastName,
                        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
                        profileImage: clerkUser.imageUrl,
                    };
                } catch {
                    return {
                        ...res,
                        firstName: null,
                        lastName: null,
                        email: null,
                        profileImage: null,
                    };
                }
            }),
        );

        return sendResponse(res, 200, "Registration fetched", enriched);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to get program registration");
        return sendResponse(res, 500, "Failed to get program registration", {
            error: error.message,
        });
    }
};

module.exports = {
    getAllTrainingPrograms,
    registerTraining,
    getTrainingRegByUser,
    getCompanyTrainingPrograms,
    createNewProgram,
    getProgramById,
    updateProgramById,
    deleteProgramById,
    getProgramRegistration,
};
