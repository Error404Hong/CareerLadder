const Projects = require("../models/projects");
const sendResponse = require("../utils/responseHelper");
const logger = require("../utils/logger");
const { clerkClient } = require("@clerk/express");

const getAllProjects = async (req, res) => {
    try {
        const result = await Projects.getAllProjects();

        const enriched = await Promise.all(
            result.map(async (res) => {
                try {
                    const clerkUser = await clerkClient.users.getUser(
                        res.company_id,
                    );

                    return {
                        ...res,
                        company_logo_url: clerkUser.imageUrl,
                        company_email:
                            clerkUser.emailAddresses[0]?.emailAddress ?? "",
                    };
                } catch {
                    return {
                        ...res,
                        company_logo_url: null,
                        company_email: null,
                    };
                }
            }),
        );

        return sendResponse(
            res,
            200,
            "Projects fetched successfully",
            enriched,
        );
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to fetch all projects: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to fetch all projects", {
            error: error.message,
        });
    }
};

const applyProjects = async (req, res) => {
    const { resume, cover_letter, skills, clerkid, listingid } = req.body;
    const resumeURL = req.file ? req.file.path : resume;

    if (!resumeURL) return sendResponse(res, 400, "Resume is required");
    if (!clerkid) return sendResponse(res, 400, "User ID is required");
    if (!listingid) return sendResponse(res, 400, "Listing ID is required");

    // parse skills from string to array
    const skillsArray =
        typeof skills === "string" ? JSON.parse(skills) : skills;

    try {
        const existing = await Projects.checkApplication(clerkid, listingid);
        if (existing)
            return sendResponse(
                res,
                200,
                "You have already applied for this project",
            );

        const result = await Projects.applyProjects(
            clerkid,
            listingid,
            resumeURL,
            cover_letter,
            skillsArray,
        );
        if (!result) return sendResponse(res, 404, "Failed to apply project");
        return sendResponse(res, 200, "Project applied successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to apply project: ", error.message);
        return sendResponse(res, 500, "Failed to apply project", {
            error: error.message,
        });
    }
};

const getUsersProjectApplications = async (req, res) => {
    const { clerkid } = req.params;

    if (!clerkid) return sendResponse(res, 400, "User ID is required");

    try {
        const result = await Projects.getUsersProjectApplications(clerkid);
        return sendResponse(
            res,
            200,
            "Project applications fetched successfully",
            result,
        );
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to get project applications: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to get project applications", {
            error: error.message,
        });
    }
};

const getProjectsByCompany = async (req, res) => {
    const { companyid } = req.params;
    if (!companyid) return sendResponse(res, 400, "Company ID is required");

    try {
        const result = await Projects.getProjectsByCompany(companyid);

        return sendResponse(res, 200, "Projects fetched successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to fetch company projects");
        return sendResponse(res, 500, "Failed to fetch company projects", {
            error: error.message,
        });
    }
};

const deleteProjectsByCompany = async (req, res) => {
    const { projectid } = req.params;
    if (!projectid) return sendResponse(res, 400, "Project ID is required");

    try {
        await Projects.deleteProjectApplications(projectid);
        const result = await Projects.deleteProjectsByCompany(projectid);

        return sendResponse(res, 200, "Project deleted successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to delete company projects");
        return sendResponse(res, 500, "Failed to delete company projects", {
            error: error.message,
        });
    }
};

const createProject = async (req, res) => {
    const {
        company_id,
        title,
        description,
        skills_required,
        duration,
        allowance,
        vacancies,
        start_date,
        end_date,
    } = req.body;

    if (!company_id) return sendResponse(res, 400, "Company ID is required");

    try {
        const result = await Projects.createProject(
            company_id,
            title,
            description,
            skills_required,
            duration,
            allowance,
            vacancies,
            start_date,
            end_date,
        );
        if (!result) return sendResponse(res, 400, "Failed to create project");
        return sendResponse(res, 200, "Project created successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to create project: ", error.message);
        return sendResponse(res, 500, "Failed to create project", {
            error: error.message,
        });
    }
};

const getProjectById = async (req, res) => {
    const { id } = req.params;
    if (!id) return sendResponse(res, 400, "Project ID is required");

    try {
        const result = await Projects.getProjectById(id);
        if (!result) return sendResponse(res, 404, "Project not found");
        return sendResponse(res, 200, "Project fetched successfully", result);
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to get project by id: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to get project", {
            error: error.message,
        });
    }
};

const updateProject = async (req, res) => {
    const { id } = req.params;
    const {
        title,
        description,
        skills_required,
        duration,
        allowance,
        vacancies,
        start_date,
        end_date,
        status,
    } = req.body;

    if (!id) return sendResponse(res, 400, "Project ID is required");

    try {
        const result = await Projects.updateProject(
            id,
            title,
            description,
            skills_required,
            duration,
            allowance,
            vacancies,
            start_date,
            end_date,
            status,
        );
        if (!result) return sendResponse(res, 400, "Failed to update project");
        return sendResponse(res, 200, "Project updated successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to update project: ", error.message);
        return sendResponse(res, 500, "Failed to update project", {
            error: error.message,
        });
    }
};

const getProjectApplicationsById = async (req, res) => {
    const { id } = req.params;
    if (!id) return sendResponse(res, 400, "Project ID is required");

    try {
        const applications = await Projects.getProjectApplicationsById(id);

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
            "Project applications fetched successfully",
            enriched,
        );
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to fetch project applications: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to fetch project applications", {
            error: error.message,
        });
    }
};

const getAllProjectApplicationByCompany = async (req, res) => {
    const { companyid } = req.params;

    if (!companyid) return sendResponse(res, 400, "Company ID is required");

    try {
        const applications =
            await Projects.getAllProjectApplicationByCompany(companyid);

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
        logger.error("[CONTROLLER] Failed to fetch project applications");
        return sendResponse(res, 500, "Failed to fetch project applications", {
            error: error.message,
        });
    }
};

const updateProjectVacancies = async (req, res) => {
    const { projectid } = req.params;

    if (!projectid) return sendResponse(res, 400, "Project id is required");

    try {
        const result = await Projects.updateProjectVacancies(projectid);
        return sendResponse(res, 200, "Project vacancies updated", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to update project vacancies");
        return sendResponse(res, 500, "Failed to update project vacancies", {
            error: error.message,
        });
    }
};

const updateProjectStatus = async (req, res) => {
    const { projectid } = req.params;
    const { status } = req.body;

    if (!projectid) return sendResponse(res, 400, "Project id is required");

    try {
        const result = await Projects.updateProjectStatus(projectid, status);
        return sendResponse(res, 200, "Status updated successfully");
    } catch (error) {
        logger.error("[CONTROLLER] Failed to update project status");
        return sendResponse(res, 500, "Failed to update project status", {
            error: error.message,
        });
    }
};

module.exports = {
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
    updateProjectVacancies,
    updateProjectStatus,
};
