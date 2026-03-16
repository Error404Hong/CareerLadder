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

module.exports = { getAllProjects };
