const Users = require("../models/users");
const sendResponse = require("../utils/responseHelper");
const logger = require("../utils/logger");

const addNewUser = async (req, res) => {
    try {
        const { clerkid, role } = req.body;
        const newUser = await Users.addNewUser(clerkid, role);

        if (!newUser) {
            return sendResponse(res, 400, "Failed to create user");
        }

        if (role === 1 || role === "1") {
            const profile = await Users.createStudentProfile(clerkid);
            if (!profile)
                return sendResponse(
                    res,
                    400,
                    "Failed to create student profile",
                );

            return sendResponse(
                res,
                200,
                "User and Student Profile Created Successfully",
                {
                    user: newUser,
                    profile,
                },
            );
        }

        if (role === 2 || role === "2") {
            const profile = await Users.createCompanyProfile(clerkid);
            if (!profile)
                return sendResponse(
                    res,
                    400,
                    "Failed to create company profile",
                );

            return sendResponse(
                res,
                200,
                "User and Company Profile Created Successfully",
                {
                    user: newUser,
                    profile,
                },
            );
        }

        return sendResponse(res, 400, "Invalid role");
    } catch (error) {
        logger.error("[CONTROLLER] Error Creating User:", error);
        return sendResponse(res, 500, "Failed to Create User", {
            error: error.message,
        });
    }
};

const getUser = async (req, res) => {
    const { clerkid } = req.params;

    if (!clerkid) {
        return sendResponse(res, 400, "Input Required");
    }

    try {
        const result = await Users.getUser(clerkid);

        if (!result) {
            return sendResponse(res, 400, "User Not Found");
        } else {
            return sendResponse(res, 200, "User Found", result);
        }
    } catch (error) {
        logger.error("[CONTROLLER] Error Getting User: ", error);
        return sendResponse(res, 500, "Failed to Get User", {
            error: error.message,
        });
    }
};

const getStudentProfile = async (req, res) => {
    const { clerkid } = req.params;

    if (!clerkid) {
        return sendResponse(res, 400, "User ID is Required");
    }

    try {
        const result = await Users.getStudentProfile(clerkid);

        if (!result) {
            return sendResponse(res, 400, "Student Profile Not Found");
        } else {
            return sendResponse(res, 200, "Student Profile Found", result);
        }
    } catch (error) {
        logger.error("[CONTROLLER] Error Getting Students Profile: ", error);
        return sendResponse(res, 500, "Failed to Get Student Profile", {
            error: error.message,
        });
    }
};

const modifyUser = async (req, res) => {
    const { linkedin_url, location, major, job_preference, work_status } =
        req.body;

    const { clerkid } = req.params;

    if (!clerkid) {
        return sendResponse(res, 400, "User ID is required");
    }

    try {
        const result = await Users.modifyUser(
            linkedin_url,
            location,
            major,
            job_preference,
            work_status,
            clerkid,
        );

        if (!result) {
            return sendResponse(res, 404, "Failed to Modify User Profile");
        } else {
            return sendResponse(
                res,
                200,
                "User Profile Modified Successfully",
                result,
            );
        }
    } catch (error) {
        logger.error("[CONTROLLER] Error Modifying User Profile: ", error);
        return sendResponse(res, 500, "Failed to Modify User Profile", {
            error: error.message,
        });
    }
};

const modifyProfileSummary = async (req, res) => {
    const { clerkid } = req.params;
    const { summary } = req.body;

    if (!clerkid) {
        return sendResponse(res, 400, "User id is required");
    }

    try {
        const result = await Users.modifyProfileSummary(summary, clerkid);

        if (!result) {
            return sendResponse(res, 404, "Failed to modify profile summary");
        } else {
            return sendResponse(res, 200, "Profile summary modified");
        }
    } catch (error) {
        logger.error("[CONTROLLER] Error Modifying Profile Summary");
        return sendResponse(res, 500, "Error Modifying Profile Summary", {
            error: error.message,
        });
    }
};

const getStudentEducation = async (req, res) => {
    const { clerkid } = req.params;

    if (!clerkid) {
        return sendResponse(res, 400, "User ID is Required");
    }

    try {
        const result = await Users.getStudentEducation(clerkid);

        if (!result) {
            return sendResponse(res, 400, "Student Education Not Found");
        } else {
            return sendResponse(res, 200, "Student Education Found", result);
        }
    } catch (error) {
        logger.error("[CONTROLLER] Error Getting Students Education: ", error);
        return sendResponse(res, 500, "Failed to Get Student Education", {
            error: error.message,
        });
    }
};

const addNewEducation = async (req, res) => {
    const { clerkid } = req.params;

    const { institution, field, start_year, end_year, is_current } = req.body;

    if (!clerkid) {
        return sendResponse(res, 400, "User ID is Required");
    }

    try {
        const result = await Users.addNewEducation(
            clerkid,
            institution,
            field,
            start_year,
            end_year,
            is_current,
        );

        if (!result) {
            return sendResponse(
                res,
                404,
                "Failed to Add Student Education",
                result,
            );
        } else {
            return sendResponse(res, 200, "Student Education Added", result);
        }
    } catch (error) {
        logger.error("[CONTROLLER] Error Adding New Education: ", error);
        return sendResponse(res, 500, "Failed to Add New Education", {
            error: error.message,
        });
    }
};

const deleteEducation = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return sendResponse(res, 400, "Education ID is Required");
    }

    try {
        await Users.deleteEducation(id);
        return sendResponse(res, 200, "Education Record Deleted Successfully");
    } catch (error) {
        logger.error("[CONTROLLER] Error Deleting Education Record: ", error);
        return sendResponse(res, 500, "Failed to Delete Education Record", {
            error: error.message,
        });
    }
};

const editEducation = async (req, res) => {
    const { id } = req.params;
    const { institution, field, start_year, end_year, is_current } = req.body;

    if (!id) {
        return sendResponse(res, 400, "Education ID is Required");
    }

    try {
        const result = await Users.editEducation(
            institution,
            field,
            start_year,
            end_year,
            is_current,
            id,
        );

        if (!result) {
            return sendResponse(res, 404, "Failed to Edit Education Record");
        } else {
            return sendResponse(
                res,
                200,
                "Education Edited Successfully",
                result,
            );
        }
    } catch (error) {
        logger.error("[CONTROLLER] Error Edit Education Record: ", error);
        return sendResponse(res, 500, "Failed to Edit Education Record", {
            error: error.message,
        });
    }
};

const getStudentExperience = async (req, res) => {
    const { clerkid } = req.params;

    if (!clerkid) {
        return sendResponse(res, 400, "User ID is Required");
    }

    try {
        const result = await Users.getStudentExperience(clerkid);

        if (!result) {
            return sendResponse(res, 400, "Student experience not found");
        } else {
            return sendResponse(res, 200, "Student experience found", result);
        }
    } catch (error) {
        logger.error("[CONTROLLER] Error getting student experience: ", error);
        return sendResponse(res, 500, "Failed to get student experience", {
            error: error.message,
        });
    }
};

const addNewExperience = async (req, res) => {
    const { clerkid } = req.params;
    const {
        jobtitle,
        company,
        start_year,
        end_year,
        is_current,
        jobdescription,
        location,
        employment_type,
    } = req.body;

    if (!clerkid) {
        return sendResponse(res, 400, "User ID is Required");
    }

    try {
        const result = await Users.addNewExperience(
            clerkid,
            jobtitle,
            company,
            start_year,
            end_year,
            is_current,
            jobdescription,
            location,
            employment_type,
        );

        if (!result) {
            return sendResponse(
                res,
                404,
                "Failed to Add New Work Experience",
                result,
            );
        } else {
            return sendResponse(res, 200, "New Work Experience Added", result);
        }
    } catch (error) {
        logger.error("[CONTROLLER] Error adding new work experience: ", error);
        return sendResponse(res, 500, "Failed to add new work experience", {
            error: error.message,
        });
    }
};

const deleteExperience = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return sendResponse(res, 400, "Experience ID is Required");
    }

    try {
        await Users.deleteExperience(id);
        return sendResponse(
            res,
            200,
            "Work Experience Record Deleted Successfully",
        );
    } catch (error) {
        logger.error(
            "[CONTROLLER] Error Deleting Work Experience Record: ",
            error,
        );
        return sendResponse(
            res,
            500,
            "Failed to Delete Work Experience Record",
            {
                error: error.message,
            },
        );
    }
};

const editExperience = async (req, res) => {
    const { id } = req.params;
    const {
        jobtitle,
        company,
        start_year,
        end_year,
        is_current,
        jobdescription,
        location,
        employment_type,
    } = req.body;

    if (!id) {
        return sendResponse(res, 400, "Experience id is required");
    }

    try {
        const result = await Users.editExperience(
            jobtitle,
            company,
            start_year,
            end_year,
            is_current,
            jobdescription,
            location,
            employment_type,
            id,
        );

        if (!result) {
            return sendResponse(
                res,
                404,
                "Failed to Edit Work Experience Record",
            );
        } else {
            return sendResponse(
                res,
                200,
                "Experience Edited Successfully",
                result,
            );
        }
    } catch (error) {
        logger.error("[CONTROLLER] Error modifying work experience");
        return sendResponse(res, 500, "Failed to modify work experience ", {
            error: error.message,
        });
    }
};

const saveResume = async (req, res) => {
    const { clerkid } = req.params;

    if (!clerkid) return sendResponse(res, 400, "User id is required");
    if (!req.file) return sendResponse(res, 400, "No file uploaded");

    try {
        const resumeURL = req.file.path;
        const result = await Users.saveResume(resumeURL, clerkid);

        if (!result) {
            return sendResponse(res, 404, "Failed to upload resume");
        } else {
            return sendResponse(
                res,
                200,
                "Resume uploaded successfully",
                result,
            );
        }
    } catch (error) {
        logger.error("[CONTROLLER] Error uploading resume");
        return sendResponse(res, 500, "Failed to upload resume", {
            error: error.message,
        });
    }
};

const deleteResume = async (req, res) => {
    const { clerkid } = req.params;
    if (!clerkid) return sendResponse(res, 400, "User ID is required");
    try {
        const result = await Users.deleteResume(clerkid);
        if (!result) return sendResponse(res, 404, "Resume failed to delete");
        return sendResponse(res, 200, "Resume deleted successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Error Deleting Resume: ", error);
        return sendResponse(res, 500, "Failed to delete resume", {
            error: error.message,
        });
    }
};

const getStudentSkills = async (req, res) => {
    const { clerkid } = req.params;

    if (!clerkid) return sendResponse(res, 400, "User id is required");

    try {
        const result = await Users.getStudentSkills(clerkid);

        if (!result) {
            return sendResponse(res, 404, "Failed to get student skills");
        } else {
            return sendResponse(
                res,
                200,
                "Successfully get student skills",
                result,
            );
        }
    } catch (error) {
        logger.error("[CONTROLLER] Error getting student skills: ", error);
        return sendResponse(res, 500, "Failed to get student skills", {
            error: error.message,
        });
    }
};

const addNewSkill = async (req, res) => {
    const { clerkid } = req.params;
    const { name } = req.body;

    if (!clerkid) return sendResponse(res, 400, "User id is required");

    try {
        const result = await Users.addNewSkill(clerkid, name);

        if (!result) {
            return sendResponse(res, 404, "Failed to add new skill");
        } else {
            return sendResponse(res, 200, "Skill added successfully", result);
        }
    } catch (error) {
        logger.error("[CONTROLLER] Error adding new skill: ", error);
        return sendResponse(res, 500, "Failed to add new skill", {
            error: error.message,
        });
    }
};

const removeSkill = async (req, res) => {
    const { id } = req.params;

    if (!id) return sendResponse(res, 400, "Skill id is required");

    try {
        await Users.removeSkill(id);
        return sendResponse(res, 200, "Skill removed successfully");
    } catch (error) {
        logger.error("[CONTROLLER] Error removing skill: ", error);
        return sendResponse(res, 500, "Failed to remove skill", {
            error: error.message,
        });
    }
};

const addLanguage = async (req, res) => {
    const { clerkid } = req.params;
    const { language, proficiency } = req.body;
    if (!clerkid) return sendResponse(res, 400, "User ID is required");
    try {
        const result = await Users.addLanguage(clerkid, language, proficiency);
        if (!result) return sendResponse(res, 400, "Failed to add language");
        return sendResponse(res, 200, "Language added successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Error adding language: ", error);
        return sendResponse(res, 500, "Failed to add language", {
            error: error.message,
        });
    }
};

const getLanguages = async (req, res) => {
    const { clerkid } = req.params;
    if (!clerkid) return sendResponse(res, 400, "User ID is required");
    try {
        const result = await Users.getLanguages(clerkid);
        return sendResponse(res, 200, "Languages fetched successfully", result);
    } catch (error) {
        logger.error("[CONTROLLER] Error getting languages: ", error);
        return sendResponse(res, 500, "Failed to get languages", {
            error: error.message,
        });
    }
};

const deleteLanguage = async (req, res) => {
    const { id } = req.params;
    if (!id) return sendResponse(res, 400, "Language ID is required");
    try {
        const result = await Users.deleteLanguage(id);
        if (!result) return sendResponse(res, 404, "Language not found");
        return sendResponse(res, 200, "Language deleted successfully");
    } catch (error) {
        logger.error("[CONTROLLER] Error deleting language: ", error);
        return sendResponse(res, 500, "Failed to delete language", {
            error: error.message,
        });
    }
};

const updateCompanyProfile = async (req, res) => {
    const { companyid } = req.params;
    const {
        company_name,
        industry,
        company_size,
        founded_year,
        website,
        location,
    } = req.body;

    if (!companyid) return sendResponse(res, 400, "Company Id is required");

    try {
        const result = await Users.updateCompanyProfile(
            company_name,
            industry,
            company_size,
            founded_year,
            website,
            location,
            companyid,
        );

        await Users.checkCompanyProfileCompleted(companyid);

        return sendResponse(
            res,
            200,
            "Company profile updated successfully",
            result,
        );
    } catch (error) {
        logger.error("[CONTROLLER] Failed to update company profile");
        return sendResponse(res, 500, "Failed to update company profile", {
            error: error.message,
        });
    }
};

const getCompanyProfile = async (req, res) => {
    const { companyid } = req.params;
    if (!companyid) return sendResponse(res, 400, "Company Id is required");

    try {
        const result = await Users.getCompanyProfile(companyid);
        return sendResponse(res, 200, "Company profile fetched", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to fetch company profile");
        return sendResponse(res, 500, "Failed to fetch company profile", {
            error: error.message,
        });
    }
};

const updateCompanyDesciption = async (req, res) => {
    const { companyid } = req.params;
    const { description } = req.body;

    if (!companyid) return sendResponse(res, 400, "Company Id is required");

    try {
        const result = await Users.updateCompanyDesciption(
            description,
            companyid,
        );
        await Users.checkCompanyProfileCompleted(companyid);
        return sendResponse(res, 200, "Company description updated", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to update company description");
        return sendResponse(res, 500, "Failed to update company description", {
            error: error.message,
        });
    }
};

module.exports = {
    addNewUser,
    getUser,
    getStudentProfile,
    modifyUser,
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
};
