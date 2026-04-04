const express = require("express");
const router = express.Router();
const {
    scheduleMeeting,
    scheduleInternalMeeting,
    rescheduleMeeting,
    getMeetingByApplication,
    getMeetingsByCompany,
    getMeetingsByApplicant,
    updateMeetingStatus,
    deleteMeeting,
    getStreamToken,
    getMeetingByRoomName,
    getApplicantMeetingById,
    getProjectInternalMeeting,
} = require("../controllers/meetingsController");

router.post("/scheduleMeeting", scheduleMeeting);
router.post("/scheduleInternalMeeting", scheduleInternalMeeting);
router.put("/rescheduleMeeting/:id", rescheduleMeeting);
router.get("/getByApplication/:applicationId", getMeetingByApplication);
router.get("/getByCompany/:companyId", getMeetingsByCompany);
router.get("/getByApplicant/:applicantId", getMeetingsByApplicant);
router.put("/updateStatus/:id", updateMeetingStatus);
router.delete("/deleteMeeting/:id", deleteMeeting);
router.get("/getToken/:userId", getStreamToken);
router.get("/getByRoomName/:roomName", getMeetingByRoomName);
router.get(
    "/getApplicantMeetingById/:referenceid/:referencetype/:applicantid",
    getApplicantMeetingById,
);
router.get("/getInternalMeetings/:projectid", getProjectInternalMeeting);

module.exports = router;
