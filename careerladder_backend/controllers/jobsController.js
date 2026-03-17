const Jobs = require("../models/jobs");
const Projects = require("../models/projects");
const sendResponse = require("../utils/responseHelper");
const logger = require("../utils/logger");

const getAllJobs = async (req, res) => {
    try {
        const result = await Jobs.getAllJobs();

        if (!result) return sendResponse(res, 404, "Failed to fetch all jobs");

        return sendResponse(res, 200, "Jobs fetched successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to fetch all jobs: ", error.message);
        return sendResponse(res, 500, "Failed to fetch all jobs", {
            error: error.message,
        });
    }
};

const applyJobs = async (req, res) => {
    const {
        clerkid,
        listingid,
        resume,
        cover_letter,
        skills,
        expected_salary,
        availability,
    } = req.body;

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
                "You have already applied for this job earlier",
            );

        const result = await Jobs.applyJobs(
            clerkid,
            listingid,
            resumeURL,
            cover_letter,
            skills,
            Number(expected_salary),
            availability,
        );

        if (!result) return sendResponse(res, 404, "Failed to apply job");

        return sendResponse(res, 200, "Job applied successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to apply job: ", error.message);
        return sendResponse(res, 500, "Failed to apply job", {
            error: error.message,
        });
    }
};

module.exports = { getAllJobs, applyJobs };
