const express = require("express");
const router = express.Router();
const { uploadResume } = require("../config/cloudinary");
const {
    getAllProjects,
    applyProjects,
    getUsersProjectApplications,
    getProjectsByCompany,
    deleteProjectsByCompany,
    createProject,
    getProjectById,
    updateProject,
    getProjectApplicationsById,
    getAllProjectApplicationByCompany,
} = require("../controllers/projectsController");

router.get("/getAllProjects", getAllProjects);
router.post("/applyProjects", uploadResume.single("resume"), applyProjects);
router.get(
    "/getUsersProjectApplications/:clerkid",
    getUsersProjectApplications,
);

// For Company / Employer
router.get("/getCompanyProjects/:companyid", getProjectsByCompany);
router.delete("/deleteCompanyProjects/:projectid", deleteProjectsByCompany);
router.post("/createProject", createProject);
router.get("/getProjectById/:id", getProjectById);
router.put("/updateProject/:id", updateProject);
router.get("/getProjectApplications/:id", getProjectApplicationsById);
router.get("/getProjectAppByCom/:companyid", getAllProjectApplicationByCompany);

module.exports = router;
