const Users = require("../models/users");
const sendResponse = require("../utils/responseHelper");
const logger = require("../utils/logger");

const addNewUser = async (req, res) => {
    try {
        const { clerkid, role } = req.body;
        const newUser = await Users.addNewUser(clerkid, role);

        if (!newUser) {
            return sendResponse(res, 400, "Failed to create user");
        }

        const profile = await Users.createStudentProfile(clerkid);

        return sendResponse(res, 200, "User and Profile Created Successfully", {
            user: newUser,
            profile: profile,
        });
    } catch (error) {
        logger.error("[CONTROLLER] Error Creating User:", error);
        return sendResponse(res, 500, "Failed to Create User", {
            error: error.message,
        });
    }
};

const getUser = async (req, res) => {
    const { clerkid } = req.params;

    if (!clerkid) {
        return sendResponse(res, 400, "Input Required");
    }

    try {
        const result = await Users.getUser(clerkid);

        if (!result) {
            return sendResponse(res, 404, "User Not Found");
        } else {
            return sendResponse(res, 200, "User Found", result);
        }
    } catch (error) {
        logger.error("[CONTROLLER] Error Getting User: ", error);
        return sendResponse(res, 500, "Failed to Get User", {
            error: error.message,
        });
    }
};

const getStudentProfile = async (req, res) => {
    const { clerkid } = req.params;

    if (!clerkid) {
        return sendResponse("User (Clerk) ID is Required");
    }

    try {
        const result = await Users.getStudentProfile(clerkid);

        if (!result) {
            return sendResponse(res, 404, "Student Profile Not Found");
        } else {
            return sendResponse(res, 200, "Student Profile Found", result);
        }
    } catch (error) {
        logger.error("[CONTROLLER] Error Getting Students Profile: ", error);
        return sendResponse(res, 500, "Failed to Get Student Profile", {
            error: error.message,
        });
    }
};

const modifyUser = async (req, res) => {
    const { linkedin_url, location, major, job_preference, work_status } =
        req.body;

    const { clerkid } = req.params;

    if (!clerkid) {
        return sendResponse(res, 400, "User ID is required");
    }

    try {
        const result = await Users.modifyUser(
            linkedin_url,
            location,
            major,
            job_preference,
            work_status,
            clerkid,
        );

        if (!result) {
            return sendResponse(res, 404, "Failed to Modify User Profile");
        } else {
            return sendResponse(
                res,
                200,
                "User Profile Modified Successfully",
                result,
            );
        }
    } catch (error) {
        logger.error("[CONTROLLER] Error Modifying User Profile: ", error);
        return sendResponse(res, 500, "Failed to Modify User Profile", {
            error: error.message,
        });
    }
};

module.exports = { addNewUser, getUser, getStudentProfile, modifyUser };
