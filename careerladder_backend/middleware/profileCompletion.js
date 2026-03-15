// middleware/profileCompletion.js
const Users = require("../models/users");
const logger = require("../utils/logger");

const checkProfileCompletion = (clerkidSource = "params") => {
    return async (req, res, next) => {
        const originalJson = res.json.bind(res);

        res.json = async function (data) {
            // only run on success responses
            if (data?.success) {
                const clerkid =
                    clerkidSource === "params"
                        ? req.params.clerkid
                        : req.body.clerkid;
                if (clerkid) {
                    try {
                        await Users.checkProfileCompleted(clerkid);
                    } catch (error) {
                        logger.error(
                            "[MIDDLEWARE] Error checking profile completion: ",
                            error,
                        );
                    }
                }
            }
            return originalJson(data);
        };

        next();
    };
};

module.exports = checkProfileCompletion;
