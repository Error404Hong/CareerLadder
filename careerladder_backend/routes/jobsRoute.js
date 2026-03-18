const express = require("express");
const router = express.Router();
const { uploadResume } = require("../config/cloudinary");
const {
    getAllJobs,
    applyJobs,
    getUsersJobApplications,
} = require("../controllers/jobsController");

router.get("/getAllJobs", getAllJobs);
router.post("/applyJobs", uploadResume.single("resume"), applyJobs);
router.get("/getUsersJobApplications/:clerkid", getUsersJobApplications);

module.exports = router;
