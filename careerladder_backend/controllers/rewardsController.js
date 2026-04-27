const Rewards = require("../models/rewards");
const sendResponse = require("../utils/responseHelper");
const logger = require("../utils/logger");

const getBadges = async (req, res) => {
    try {
        const result = await Rewards.getBadges();
        return sendResponse(res, 200, "Badges fetched", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to get all badges: ", error);
        return sendResponse(res, 500, "Failed to get all badges", {
            error: error.message,
        });
    }
};

const addBadge = async (req, res) => {
    const { name, description, icon } = req.body;

    try {
        const result = await Rewards.addBadge(name, description, icon);
        return sendResponse(res, 200, "New badge added", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to add new badge: ", error);
        return sendResponse(res, 500, "Failed to add new badge", {
            error: error.message,
        });
    }
};

const deleteBadge = async (req, res) => {
    const { id } = req.params;
    if (!id) return sendResponse(res, 400, "Badge ID is required");

    try {
        const result = await Rewards.deleteBadge(id);
        return sendResponse(res, 200, "Badge deleted", result);
    } catch (error) {
        console.log("[CONTROLLER] Failed to delete badge: ", error);
        return sendResponse(res, 500, "Failed to delete badge", {
            error: error.message,
        });
    }
};

const updateBadge = async (req, res) => {
    const { id } = req.params;
    const { name, description, icon } = req.body;
    if (!id) return sendResponse(res, 400, "Badge ID is required");

    try {
        const result = await Rewards.updateBadge(name, description, icon, id);
        return sendResponse(res, 200, "Badge updated", result);
    } catch (error) {
        console.log("[CONTROLLER] Failed to update badge: ", error);
        return sendResponse(res, 500, "Failed to update badge", {
            error: error.message,
        });
    }
};

const getBadgesByStudent = async (req, res) => {
    const { studentid } = req.params;
    if (!studentid) return sendResponse(res, 400, "Student ID is required");

    try {
        const result = await Rewards.getBadgesByStudent(studentid);
        return sendResponse(res, 200, "Fetched student badges", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to get badge: ", error);
        return sendResponse(res, 500, "Failed to get badge", {
            error: error.message,
        });
    }
};

const awardBadge = async (req, res) => {
    const { studentid } = req.params;
    const { badgeid, projectid, awardedby } = req.body;
    if (!studentid || !badgeid || !projectid || !awardedby)
        return sendResponse(res, 400, "Missing required IDs");

    console.log("BODY: ", req.body);
    console.log("PARAMS:", req.params);

    try {
        const result = await Rewards.awardBadge(
            studentid,
            badgeid,
            projectid,
            awardedby,
        );
        return sendResponse(res, 200, "Badge awarded", result);
    } catch (error) {
        console.log("[CONTROLLER] Failed to award badge: ", error);
        return sendResponse(res, 500, "Failed to award badge", {
            error: error.message,
        });
    }
};

const issueCertification = async (req, res) => {
    const { studentid } = req.params;
    const { projectid, employerid } = req.body;

    if (!studentid || !projectid || !employerid)
        return sendResponse(res, 400, "Missing required IDs");

    try {
        const certificationURL = req.file?.path ?? null;

        const result = await Rewards.issueCertification(
            studentid,
            projectid,
            employerid,
            certificationURL,
        );
        return sendResponse(res, 200, "Cert issued", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to issue cert: ", error);
        return sendResponse(res, 500, "Failed to issue cert", {
            error: error.message,
        });
    }
};

const getStudentCertifications = async (req, res) => {
    const { studentid } = req.params;
    if (!studentid) return sendResponse(res, 400, "Student ID is required");

    try {
        const result = await Rewards.getStudentCertifications(studentid);
        return sendResponse(res, 200, "Certs fetched", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to get student cert: ", error);
        return sendResponse(res, 500, "Failed to get student cert", {
            error: error.message,
        });
    }
};

const awardExperiencePoints = async (req, res) => {
    const { studentid } = req.params;
    const { exppoints } = req.body;
    if (!studentid) return sendResponse(res, 400, "Student ID is required");

    try {
        const result = await Rewards.awardExperiencePoints(
            exppoints,
            studentid,
        );
        return sendResponse(res, 200, "Exp awarded", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to award exp: ", error);
        return sendResponse(res, 500, "Failed to award exp", {
            error: error.message,
        });
    }
};

const getStudentExpPoints = async (req, res) => {
    const { studentid } = req.params;
    if (!studentid) return sendResponse(res, 400, "Student ID is required");

    try {
        const result = await Rewards.getStudentExpPoints(studentid);
        return sendResponse(res, 200, "Fetched student exp", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to get student exp: ", error);
        return sendResponse(res, 500, "Failed to get student exp", {
            error: error.message,
        });
    }
};

module.exports = {
    getBadges,
    addBadge,
    deleteBadge,
    updateBadge,
    getBadgesByStudent,
    awardBadge,
    issueCertification,
    getStudentCertifications,
    awardExperiencePoints,
    getStudentExpPoints,
};
