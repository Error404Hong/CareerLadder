const express = require("express");
const router = express.Router();
const { uploadResume } = require("../config/cloudinary");
const { getAllJobs, applyJobs } = require("../controllers/jobsController");

router.get("/getAllJobs", getAllJobs);
router.post("/applyJobs", uploadResume.single("resume"), applyJobs);

module.exports = router;
