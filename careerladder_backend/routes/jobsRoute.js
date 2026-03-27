const express = require("express");
const router = express.Router();
const { uploadResume } = require("../config/cloudinary");
const {
    getAllJobs,
    applyJobs,
    getUsersJobApplications,
    getJobsByCompany,
    createJob,
    deleteJob,
    getJobById,
    updateJob,
    getJobApplicationById,
    getApplicantsProfile,
    updateApplicationStatus,
    getAllJobsApplicationByCompany,
    updateJobVacancies,
    updateJobStatus,
} = require("../controllers/jobsController");

router.get("/getAllJobs", getAllJobs);
router.post("/applyJobs", uploadResume.single("resume"), applyJobs);
router.get("/getUsersJobApplications/:clerkid", getUsersJobApplications);
router.get("/getJobsByCompany/:companyid", getJobsByCompany);
router.post("/createJob", createJob);
router.delete("/deleteJob/:id", deleteJob);
router.get("/getJob/:id", getJobById);
router.put("/updateJob/:id", updateJob);
router.get("/getJobApplications/:id", getJobApplicationById);
router.get("/getApplicantsProfile/:id", getApplicantsProfile);
router.put("/updateApplicationStatus/:id", updateApplicationStatus);
router.get("/getJobsAppByCom/:companyid", getAllJobsApplicationByCompany);
router.put("/updateJobVacancies/:jobid", updateJobVacancies);
router.put("/updateJobStatus/:jobid", updateJobStatus);

module.exports = router;
