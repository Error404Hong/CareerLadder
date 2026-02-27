const Users = require("../models/users");
const sendResponse = require("../utils/responseHelper");

const addNewUser = async (req, res) => {
    try {
        const { clerkid, role } = req.body;
        const newUser = await Users.addNewUser(clerkid, role);
        return sendResponse(res, 200, "User Created Successfully", newUser);
    } catch (error) {
        console.error("Error Creating User:", error);
        return sendResponse(res, 500, "Failed to Create User", {
            error: error.message,
        });
    }
};

module.exports = { addNewUser };
