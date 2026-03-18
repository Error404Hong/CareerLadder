const Projects = require("../models/projects");
const sendResponse = require("../utils/responseHelper");
const logger = require("../utils/logger");

const getAllProjects = async (req, res) => {
    try {
        const result = await Projects.getAllProjects();

        if (!result)
            return sendResponse(res, 404, "Failed to fetch all projects");

        return sendResponse(res, 200, "Projects fetched successfully", result);
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to fetch all projects: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to fetch all projects", {
            error: error.message,
        });
    }
};

const applyProjects = async (req, res) => {
    const { resume, cover_letter, skills, clerkid, listingid } = req.body;
    const resumeURL = req.file ? req.file.path : resume;

    if (!resumeURL) return sendResponse(res, 400, "Resume is required");
    if (!clerkid) return sendResponse(res, 400, "User ID is required");
    if (!listingid) return sendResponse(res, 400, "Listing ID is required");

    try {
        const existing = await Projects.checkApplication(clerkid, listingid);
        if (existing)
            return sendResponse(
                res,
                200,
                "You have already applied for this project",
            );

        const result = await Projects.applyProjects(
            clerkid,
            listingid,
            resumeURL,
            cover_letter,
            skills,
        );

        if (!result) return sendResponse(res, 404, "Failed to apply project");

        return sendResponse(res, 200, "Project applied successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to apply project: ", error.message);
        return sendResponse(res, 500, "Failed to apply project", {
            error: error.message,
        });
    }
};

const getUsersProjectApplications = async (req, res) => {
    const { clerkid } = req.params;

    if (!clerkid) return sendResponse(res, 400, "User ID is required");

    try {
        const result = await Projects.getUsersProjectApplications(clerkid);
        return sendResponse(
            res,
            200,
            "Project applications fetched successfully",
            result,
        );
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to get project applications: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to get project applications", {
            error: error.message,
        });
    }
};

module.exports = { getAllProjects, applyProjects, getUsersProjectApplications };
