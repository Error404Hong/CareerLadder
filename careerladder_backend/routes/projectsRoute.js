const express = require("express");
const router = express.Router();
const { uploadResume } = require("../config/cloudinary");
const {
    getAllProjects,
    applyProjects,
} = require("../controllers/projectsController");

router.get("/getAllProjects", getAllProjects);
router.post("/applyProjects", uploadResume.single("resume"), applyProjects);

module.exports = router;
