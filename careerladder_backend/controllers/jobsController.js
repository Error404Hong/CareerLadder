const Jobs = require("../models/jobs");
const Projects = require("../models/projects");
const sendResponse = require("../utils/responseHelper");
const logger = require("../utils/logger");
const { clerkClient } = require("@clerk/express");

const getAllJobs = async (req, res) => {
    try {
        const result = await Jobs.getAllJobs();

        if (!result) return sendResponse(res, 404, "Failed to fetch all jobs");

        return sendResponse(res, 200, "Jobs fetched successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to fetch all jobs: ", error.message);
        return sendResponse(res, 500, "Failed to fetch all jobs", {
            error: error.message,
        });
    }
};

const applyJobs = async (req, res) => {
    const {
        clerkid,
        listingid,
        resume,
        cover_letter,
        skills,
        expected_salary,
        availability,
    } = req.body;

    const resumeURL = req.file ? req.file.path : resume;
    if (!resumeURL) return sendResponse(res, 400, "Resume is required");
    if (!clerkid) return sendResponse(res, 400, "User ID is required");
    if (!listingid) return sendResponse(res, 400, "Listing ID is required");

    try {
        const existing = await Projects.checkApplication(clerkid, listingid);

        if (existing)
            return sendResponse(
                res,
                200,
                "You have already applied for this job earlier",
            );

        const result = await Jobs.applyJobs(
            clerkid,
            listingid,
            resumeURL,
            cover_letter,
            skills,
            Number(expected_salary),
            availability,
        );

        if (!result) return sendResponse(res, 404, "Failed to apply job");

        return sendResponse(res, 200, "Job applied successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to apply job: ", error.message);
        return sendResponse(res, 500, "Failed to apply job", {
            error: error.message,
        });
    }
};

const getUsersJobApplications = async (req, res) => {
    const { clerkid } = req.params;

    if (!clerkid) return sendResponse(res, 400, "User ID is required");

    try {
        const result = await Jobs.getUsersJobApplications(clerkid);
        return sendResponse(
            res,
            200,
            "Job applications fetched successfully",
            result,
        );
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to get job applications: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to get job applications", {
            error: error.message,
        });
    }
};

const getJobsByCompany = async (req, res) => {
    const { companyid } = req.params;

    if (!companyid) return sendResponse(res, 400, "Company id is required");

    try {
        const result = await Jobs.getJobsByCompany(companyid);
        return sendResponse(res, 200, "Job listings fetched", result);
    } catch (error) {
        logger.error("[CONTROLLER Failed to get job listings");
        return sendResponse(req, 500, "Failed to get job listings", {
            error: error.message,
        });
    }
};

const createJob = async (req, res) => {
    const {
        company_id,
        title,
        description,
        requirements,
        skills_required,
        employment_type,
        salary_min,
        salary_max,
        location,
        is_remote,
        vacancies,
    } = req.body;

    if (!company_id) return sendResponse(res, 400, "Company ID is required");

    try {
        const result = await Jobs.createJob(
            company_id,
            title,
            description,
            requirements,
            skills_required,
            employment_type,
            salary_min,
            salary_max,
            location,
            is_remote,
            vacancies,
        );
        return sendResponse(res, 200, "Job created successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to create job: ", error.message);
        return sendResponse(res, 500, "Failed to create job", {
            error: error.message,
        });
    }
};

const deleteJob = async (req, res) => {
    const { id } = req.params;

    if (!id) return sendResponse(res, 400, "Job ID is required");

    try {
        const result = await Jobs.deleteJob(id);
        return sendResponse(res, 200, "Job deleted successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to delete job: ", error.message);
        return sendResponse(res, 500, "Failed to delete job", {
            error: error.message,
        });
    }
};

const getJobById = async (req, res) => {
    const { id } = req.params;
    if (!id) return sendResponse(res, 400, "Job ID is required");

    try {
        const result = await Jobs.getJobById(id);
        return sendResponse(res, 200, "Job fetched successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to fetch job: ", error.message);
        return sendResponse(res, 500, "Failed to fetch job", {
            error: error.message,
        });
    }
};

const updateJob = async (req, res) => {
    const { id } = req.params;
    const {
        title,
        description,
        requirements,
        skills_required,
        employment_type,
        salary_min,
        salary_max,
        location,
        is_remote,
        vacancies,
    } = req.body;

    if (!id) return sendResponse(res, 400, "Job ID is required");

    try {
        const result = await Jobs.updateJob(
            id,
            title,
            description,
            requirements,
            skills_required,
            employment_type,
            salary_min,
            salary_max,
            location,
            is_remote,
            vacancies,
        );
        if (!result) return sendResponse(res, 400, "Failed to update job");
        return sendResponse(res, 200, "Job updated successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to update job: ", error.message);
        return sendResponse(res, 500, "Failed to update job", {
            error: error.message,
        });
    }
};

const getJobApplicationById = async (req, res) => {
    const { id } = req.params;
    if (!id) return sendResponse(res, 400, "Job ID is required");

    try {
        const applications = await Jobs.getJobApplicationById(id);

        // enrich each application with Clerk user data
        const enriched = await Promise.all(
            applications.map(async (app) => {
                try {
                    const clerkUser = await clerkClient.users.getUser(
                        app.clerk_id,
                    );
                    return {
                        ...app,
                        first_name: clerkUser.firstName,
                        last_name: clerkUser.lastName,
                        image_url: clerkUser.imageUrl,
                        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
                    };
                } catch {
                    return {
                        ...app,
                        first_name: null,
                        last_name: null,
                        image_url: null,
                        email: null,
                    };
                }
            }),
        );

        return sendResponse(
            res,
            200,
            "Job applications fetched successfully",
            enriched,
        );
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to fetch job applications: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to fetch job applications", {
            error: error.message,
        });
    }
};

const getApplicantsProfile = async (req, res) => {
    const { id } = req.params;
    if (!id) return sendResponse(res, 400, "Application ID is required");

    try {
        const application = await Jobs.getApplicantsProfile(id);
        if (!application)
            return sendResponse(res, 404, "Application not found");

        const clerkUser = await clerkClient.users.getUser(application.clerk_id);
        const result = {
            ...application,
            first_name: clerkUser.firstName,
            last_name: clerkUser.lastName,
            email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
            image_url: clerkUser.imageUrl,
        };

        return sendResponse(
            res,
            200,
            "Application fetched successfully",
            result,
        );
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to fetch application: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to fetch application", {
            error: error.message,
        });
    }
};

const updateApplicationStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) return sendResponse(res, 400, "Application ID is required");
    if (!status) return sendResponse(res, 400, "Status is required");

    try {
        const result = await Jobs.updateApplicationStatus(id, status);
        if (!result)
            return sendResponse(
                res,
                400,
                "Failed to update application status",
            );
        return sendResponse(
            res,
            200,
            "Application status updated successfully",
            result,
        );
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to update application status: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to update application status", {
            error: error.message,
        });
    }
};

const getAllJobsApplicationByCompany = async (req, res) => {
    const { companyid } = req.params;

    if (!companyid) return sendResponse(res, 400, "Company ID is required");

    try {
        const applications =
            await Jobs.getAllJobsApplicationByCompany(companyid);

        const result = await Promise.all(
            applications.map(async (app) => {
                const user = await clerkClient.users.getUser(app.clerk_id);

                return {
                    ...app,
                    first_name: user.firstName,
                    last_name: user.lastName,
                    email: user.emailAddresses[0]?.emailAddress ?? "",
                    image_url: user.imageUrl,
                };
            }),
        );

        return sendResponse(
            res,
            200,
            "Applications fetch successfully",
            result,
        );
    } catch (error) {
        logger.error("[CONTROLLER] Failed to fetch all job applications");
        return sendResponse(res, 500, "Failed to fetch all job applications", {
            error: error.message,
        });
    }
};

module.exports = {
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
};
