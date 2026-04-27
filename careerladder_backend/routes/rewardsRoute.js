const express = require("express");
const router = express.Router();
const { uploadCertification } = require("../config/cloudinary");
const {
    getBadges,
    addBadge,
    deleteBadge,
    updateBadge,
    getBadgesByStudent,
    awardBadge,
    issueCertification,
    getStudentCertifications,
    awardExperiencePoints,
    getStudentExpPoints,
} = require("../controllers/rewardsController");

// Badge management (admin)
router.get("/badges", getBadges);
router.post("/badges", addBadge);
router.put("/badges/:id", updateBadge);
router.delete("/badges/:id", deleteBadge);

// Student badges
router.get("/badges/student/:studentid", getBadgesByStudent);
router.post("/badges/award/:studentid", awardBadge);

// Certifications
router.post(
    "/certifications/:studentid",
    uploadCertification.single("certification"),
    issueCertification,
);
router.get("/certifications/:studentid", getStudentCertifications);

// Experience points
router.post("/exp/:studentid", awardExperiencePoints);
router.get("/exp/:studentid", getStudentExpPoints);

module.exports = router;
