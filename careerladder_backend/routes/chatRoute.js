const express = require("express");
const router = express.Router();
const {
    getChatToken,
    createChannel,
} = require("../controllers/chatController");

router.get("/getToken/:userid", getChatToken);
router.post("/createChannel", createChannel);

module.exports = router;
