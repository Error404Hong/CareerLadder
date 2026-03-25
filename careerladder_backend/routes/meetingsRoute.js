const express = require("express");
const router = express.Router();
const {
    scheduleMeeting,
    getMeetingByApplication,
    getMeetingsByCompany,
    getMeetingsByApplicant,
    updateMeetingStatus,
    deleteMeeting,
    getStreamToken,
    getMeetingByRoomName,
} = require("../controllers/meetingsController");

router.post("/scheduleMeeting", scheduleMeeting);
router.get("/getByApplication/:applicationId", getMeetingByApplication);
router.get("/getByCompany/:companyId", getMeetingsByCompany);
router.get("/getByApplicant/:applicantId", getMeetingsByApplicant);
router.put("/updateStatus/:id", updateMeetingStatus);
router.delete("/deleteMeeting/:id", deleteMeeting);
router.get("/getToken/:userId", getStreamToken);
router.get("/getByRoomName/:roomName", getMeetingByRoomName);

module.exports = router;
