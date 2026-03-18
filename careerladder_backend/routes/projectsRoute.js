const express = require("express");
const router = express.Router();
const { uploadResume } = require("../config/cloudinary");
const {
    getAllProjects,
    applyProjects,
    getUsersProjectApplications,
} = require("../controllers/projectsController");

router.get("/getAllProjects", getAllProjects);
router.post("/applyProjects", uploadResume.single("resume"), applyProjects);
router.get(
    "/getUsersProjectApplications/:clerkid",
    getUsersProjectApplications,
);

module.exports = router;
