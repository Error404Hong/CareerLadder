const Users = require("../models/users");
const sendResponse = require("../utils/responseHelper");
const logger = require("../utils/logger");
const { clerkClient } = require("@clerk/express");

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
        const basicInfo = await Users.getStudentInfo(clerkid);
        const result = await Users.getStudentProfile(clerkid);

        const user = await clerkClient.users.getUser(clerkid);
        const enriched = {
            ...basicInfo,
            ...result,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImage: user.imageUrl,
            email: user.emailAddresses[0]?.emailAddress ?? "",
        };

        return sendResponse(res, 200, "Student Profile Found", enriched);
    } catch (error) {
        console.log("[CONTROLLER] Error Getting Students Profile: ", error);
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
        const basicInfo = await Users.getCompanyBasicInfo(companyid);
        const result = await Users.getCompanyProfile(companyid);
        const user = await clerkClient.users.getUser(companyid);

        const enriched = {
            ...basicInfo,
            ...result,
            email: user.emailAddresses[0]?.emailAddress ?? "",
            image_url: user.imageUrl,
        };
        return sendResponse(res, 200, "Company profile fetched", enriched);
    } catch (error) {
        console.log("[CONTROLLER] Failed to fetch company profile: ", error);
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

const getAllStudent = async (req, res) => {
    try {
        const allUsers = await Users.getAllStudent();

        const result = await Promise.all(
            allUsers.map(async (user) => {
                try {
                    const clerkUser = await clerkClient.users.getUser(
                        user.clerk_id,
                    );

                    return {
                        ...user,
                        firstName: clerkUser.firstName,
                        lastName: clerkUser.lastName,
                        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
                        profileImage: clerkUser.imageUrl,
                    };
                } catch {
                    return {
                        ...user,
                        firstName: null,
                        lastName: null,
                        email: null,
                        profileImage: null,
                    };
                }
            }),
        );

        return sendResponse(
            res,
            200,
            "Fetched all students successfully",
            result,
        );
    } catch (error) {
        logger.error("[CONTROLLER] Failed to fetch all students");
        return sendResponse(res, 500, "Failed to fetch all students", {
            error: error.message,
        });
    }
};

const getAllCompany = async (req, res) => {
    try {
        const companies = await Users.getAllCompany();

        const enrichedProfiles = await Promise.all(
            companies.map(async (company) => {
                const user = await clerkClient.users.getUser(
                    company.company_id,
                );

                return {
                    ...company,
                    email: user.emailAddresses[0]?.emailAddress ?? "",
                    image_url: user.imageUrl,
                };
            }),
        );

        return sendResponse(res, 200, "Companies fetched", enrichedProfiles);
    } catch (error) {
        console.log("[CONTROLLER] Failed to get all company:", error);
        return sendResponse(res, 500, "Failed to get all company", {
            error: error.message,
        });
    }
};

const writeReview = async (req, res) => {
    const { company_id, student_id, rating, review_text } = req.body;

    if (!company_id || !student_id)
        return sendResponse(res, 400, "Failed due to missing ids");

    try {
        const result = await Users.writeReview(
            company_id,
            student_id,
            rating,
            review_text,
        );
        return sendResponse(res, 200, "Review written successfully", result);
    } catch (error) {
        console.log("[CONTROLLER] Failed to write review: ", error);

        if (
            error.message.includes(
                "duplicate key value violates unique constraint",
            )
        ) {
            return sendResponse(res, 200, "duplicated_review", {
                error: error.message,
            });
        }

        return sendResponse(res, 500, "Failed to write review", {
            error: error.message,
        });
    }
};

const getReviewsByCompany = async (req, res) => {
    const { companyid } = req.params;
    if (!companyid) return sendResponse(res, 400, "Company ID is required");

    try {
        const reviews = await Users.getReviewsByCompany(companyid);

        const enrichedResults = await Promise.all(
            reviews.map(async (review) => {
                const user = await clerkClient.users.getUser(review.student_id);

                return {
                    ...review,
                    first_name: user.firstName,
                    last_name: user.lastName,
                    profile_image: user.imageUrl,
                };
            }),
        );

        return sendResponse(
            res,
            200,
            "Fetched company reviews",
            enrichedResults,
        );
    } catch (error) {
        console.log("[CONTROLLER] Failed to get company reviews");
        return sendResponse(res, 500, "Failed to get company reviews", {
            error: error.message,
        });
    }
};

const getAllCompanyReviews = async (req, res) => {
    try {
        const reviews = await Users.getAllCompanyReviews();

        const enrichedResults = await Promise.all(
            reviews.map(async (review) => {
                try {
                    const user = await clerkClient.users.getUser(review.student_id);
                    return {
                        ...review,
                        first_name: user.firstName,
                        last_name: user.lastName,
                        profile_image: user.imageUrl,
                    };
                } catch {
                    return { ...review, first_name: "Unknown", last_name: "", profile_image: null };
                }
            }),
        );

        return sendResponse(res, 200, "Fetched all company reviews", enrichedResults);
    } catch (error) {
        console.log("[CONTROLLER] Failed to get all company reviews: ", error);
        return sendResponse(res, 500, "Failed to get all company reviews", { error: error.message });
    }
};

const deleteCompanyReview = async (req, res) => {
    const { reviewid } = req.params;
    if (!reviewid) return sendResponse(res, 400, "Review ID is required");

    try {
        const result = await Users.deleteCompanyReview(reviewid);
        if (!result) return sendResponse(res, 404, "Review not found");
        return sendResponse(res, 200, "Review deleted successfully", result);
    } catch (error) {
        console.log("[CONTROLLER] Failed to delete company review: ", error);
        return sendResponse(res, 500, "Failed to delete review", { error: error.message });
    }
};

const getStudentPerformance = async (req, res) => {
    const { clerkid } = req.params;
    if (!clerkid) return sendResponse(res, 400, "Clerk ID is required");

    try {
        const result = await Users.getStudentPerformance(clerkid);

        const enriched = await Promise.all(
            result.map(async (res) => {
                const user = await clerkClient.users.getUser(res.employer_id);

                return {
                    ...res,
                    companyLogo: user.imageUrl,
                    email: user.emailAddresses[0]?.emailAddress ?? "",
                };
            }),
        );

        return sendResponse(res, 200, "Student performance fetched", enriched);
    } catch (error) {
        console.log("[CONTROLLER] Failed to get student performance: ", error);
        return sendResponse(res, 500, "Failed to get student performance", {
            error: error.message,
        });
    }
};

const deleteUser = async (req, res) => {
    const { clerkid } = req.params;
    try {
        const deleted = await Users.deleteUser(clerkid);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, data: deleted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateUserStatus = async (req, res) => {
    const { clerkid } = req.params;
    const { status } = req.body;
    try {
        const updated = await Users.updateStatus(clerkid, status);
        if (!updated) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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
    getAllStudent,
    getAllCompany,
    writeReview,
    getReviewsByCompany,
    getAllCompanyReviews,
    deleteCompanyReview,
    getStudentPerformance,
    updateUserStatus,
    deleteUser,
};
