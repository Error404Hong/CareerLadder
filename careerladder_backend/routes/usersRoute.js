const express = require("express");
const router = express.Router();
const { uploadResume } = require("../config/cloudinary");
const checkProfileCompletion = require("../middleware/profileCompletion");
const {
    addNewUser,
    getUser,
    modifyUser,
    getStudentProfile,
    modifyProfileSummary,
    getStudentEducation,
    addNewEducation,
    deleteEducation,
    editEducation,
    getStudentExperience,
    addNewExperience,
    deleteExperience,
    editExperience,
    saveResume,
    deleteResume,
    getStudentSkills,
    addNewSkill,
    removeSkill,
    addLanguage,
    getLanguages,
    deleteLanguage,
    updateCompanyProfile,
    getCompanyProfile,
    updateCompanyDesciption,
    getAllStudent,
    getAllCompany,
    writeReview,
    getReviewsByCompany,
} = require("../controllers/usersController");

router.post("/addNewUser", addNewUser);
router.get("/getUser/:clerkid", getUser);
router.get("/getProfile/:clerkid", getStudentProfile);
router.put("/modifyUser/:clerkid", checkProfileCompletion(), modifyUser);
router.put(
    "/modifyProfileSummary/:clerkid",
    checkProfileCompletion(),
    modifyProfileSummary,
);
router.get("/getEducation/:clerkid", getStudentEducation);
router.post(
    "/addEducation/:clerkid",
    checkProfileCompletion(),
    addNewEducation,
);
router.delete("/deleteEducation/:id", deleteEducation);
router.put("/editEducation/:id", editEducation);
router.get("/getExperience/:clerkid", getStudentExperience);
router.post(
    "/addExperience/:clerkid",
    checkProfileCompletion(),
    addNewExperience,
);
router.delete("/deleteExperience/:id", deleteExperience);
router.put("/editExperience/:id", editExperience);
router.put(
    "/saveResume/:clerkid",
    uploadResume.single("resume"),
    checkProfileCompletion(),
    saveResume,
);
router.put("/deleteResume/:clerkid", checkProfileCompletion(), deleteResume);
router.get("/getSkills/:clerkid", getStudentSkills);
router.post("/addSkill/:clerkid", checkProfileCompletion(), addNewSkill);
router.delete("/removeSkill/:id", removeSkill);
router.get("/getLanguages/:clerkid", getLanguages);
router.post("/addLanguage/:clerkid", checkProfileCompletion(), addLanguage);
router.delete("/deleteLanguage/:id", deleteLanguage);
router.put("/updateCompanyProfile/:companyid", updateCompanyProfile);
router.get("/getCompanyProfile/:companyid", getCompanyProfile);
router.put("/updateDescription/:companyid", updateCompanyDesciption);
router.get("/getAllStudent", getAllStudent);
router.get("/getAllCompany", getAllCompany);
router.post("/writeReview", writeReview);
router.get("/getCompanyReviews/:companyid", getReviewsByCompany);

module.exports = router;
