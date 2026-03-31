const sendResponse = require("../utils/responseHelper");
const { StreamChat } = require("stream-chat");

const serverClient = StreamChat.getInstance(
    process.env.STREAM_API_KEY,
    process.env.STREAM_API_SECRET,
);

const getChatToken = async (req, res) => {
    const { userid } = req.params;
    if (!userid) return sendResponse(res, 400, "User id is required");

    try {
        await serverClient.upsertUsers([{ id: userid }]);
        const token = serverClient.createToken(userid);
        return sendResponse(res, 200, "Chat token generated", { token });
    } catch (error) {
        console.log("[CONTROLLER] Failed to get chat token: ", error);
        return sendResponse(res, 500, "Failed to get chat token", {
            error: error.message,
        });
    }
};

const createChannel = async (req, res) => {
    const { companyid, studentid } = req.body;

    if (!companyid || !studentid)
        return sendResponse(res, 400, "companyid and studentid are required");

    try {
        await serverClient.upsertUsers([{ id: companyid }, { id: studentid }]);

        // Generate channel id (max 64 chars)
        const channelId = [companyid, studentid].sort().map(id => id.replace(/_/g, "").substring(0, 30)).join("-");

        // Create channel
        const channel = serverClient.channel("messaging", channelId, {
            members: [companyid, studentid],
            created_by_id: companyid,
        });

        await channel.create();
        return sendResponse(res, 200, "Channel ready", { channelId });
    } catch (error) {
        console.log("[CONTROLLER] Failed to create channel: ", error);
        return sendResponse(res, 500, "Failed to create channel", {
            error: error.message,
        });
    }
};

module.exports = { getChatToken, createChannel };
