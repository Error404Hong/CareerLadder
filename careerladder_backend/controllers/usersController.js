const Users = require("../models/users");
const sendResponse = require("../utils/responseHelper");

const addNewUser = async (req, res) => {
    try {
        const { clerkid, role } = req.body;
        const newUser = await Users.addNewUser(clerkid, role);
        return sendResponse(res, 200, "User Created Successfully", newUser);
    } catch (error) {
        console.error("[CONTROLLER] Error Creating User:", error);
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
        console.error("[CONTROLLER] Error Getting User: ", error);
        return sendResponse(res, 500, "Failed to Get User", {
            error: error.message,
        });
    }
};

module.exports = { addNewUser, getUser };
