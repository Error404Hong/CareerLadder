import axiosInstance from "./config";

export const addNewUser = async (clerkid: string, role: number) => {
    try {
        const response = await axiosInstance.post("/users/addNewUser", {
            clerkid,
            role,
        });

        console.log("User Added:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error Adding New User: ", error);
        throw error;
    }
};

export const getUserById = async (clerkid: string) => {
    try {
        const response = await axiosInstance.get(`/users/getUser/${clerkid}`);

        console.log("User Fetched: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error Getting User: ", error);
        throw error;
    }
};

export const getStudentProfile = async (clerkid: string) => {
    try {
        const response = await axiosInstance.get(
            `/users/getProfile/${clerkid}`,
        );

        console.log("Student Profile: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error Fetching Student Profile: ", error);
        throw error;
    }
};

export const modifyUserProfile = async (
    linkedin_url: string,
    location: string,
    major: string,
    job_preference: string,
    work_status: boolean,
    clerkid: string,
) => {
    try {
        const response = await axiosInstance.put(
            `/users/modifyUser/${clerkid}`,
            {
                linkedin_url,
                location,
                major,
                job_preference,
                work_status,
            },
        );

        console.log("User Profile Modified: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error Modifying User Profile: ", error);
        throw error;
    }
};

export const modifyProfileSummary = async (
    summary: string,
    clerkid: string,
) => {
    try {
        const response = await axiosInstance.put(
            `/users/modifyProfileSummary/${clerkid}`,
            {
                summary,
            },
        );

        console.log("Profile Summary Modified: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error Modifying Profile Summary: ", error);
        throw error;
    }
};

export const getStudentEducation = async (clerkid: string) => {
    try {
        const response = await axiosInstance.get(
            `/users/getEducation/${clerkid}`,
        );
        console.log("Student Education: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error Getting Student Education: ", error);
        throw error;
    }
};

export const addNewEducation = async (
    clerkid: string,
    institution: string,
    field: string,
    start_year: string,
    end_year: string,
    is_current: boolean,
) => {
    try {
        const response = await axiosInstance.post(
            `/users/addEducation/${clerkid}`,
            {
                institution,
                field,
                start_year,
                end_year: is_current ? null : end_year,
                is_current,
            },
        );
        console.log("Added Education: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error Add New Student Education: ", error);
        throw error;
    }
};

export const deleteEducation = async (educationid: number) => {
    try {
        const response = await axiosInstance.delete(
            `/users/deleteEducation/${educationid}`,
        );
        console.log("Deleted Education: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error Deleting Education Record: ", error);
        throw error;
    }
};

export const editEducation = async (
    institution: string,
    field: string,
    start_year: string,
    end_year: string,
    is_current: boolean,
    educationid: number,
) => {
    try {
        const response = await axiosInstance.put(
            `/users/editEducation/${educationid}`,
            {
                institution,
                field,
                start_year,
                end_year: is_current ? null : end_year,
                is_current,
            },
        );

        console.log("Edited Education: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error Editing Education Record: ", error);
        throw error;
    }
};

export const getStudentExperience = async (clerkid: string) => {
    try {
        const response = await axiosInstance.get(
            `/users/getExperience/${clerkid}`,
        );

        console.log("Student Experience: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error getting student experience: ", error);
        throw error;
    }
};

export const addNewExperience = async (
    clerkid: string,
    jobtitle: string,
    company: string,
    start_year: string,
    end_year: string,
    is_current: boolean,
    jobdescription: string,
    location: string,
    employment_type: string,
) => {
    try {
        const response = await axiosInstance.post(
            `/users/addExperience/${clerkid}`,
            {
                jobtitle,
                company,
                start_year,
                end_year,
                is_current,
                jobdescription,
                location,
                employment_type,
            },
        );

        console.log("Added Experience: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error adding new student experience: ", error);
        throw error;
    }
};

export const deleteExperience = async (experienceid: number) => {
    try {
        const response = await axiosInstance.delete(
            `/users/deleteExperience/${experienceid}`,
        );
        console.log("DELETED EXPERIENCE: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error Deleting Work Experience Record: ", error);
        throw error;
    }
};

export const editExperience = async (
    jobtitle: string,
    company: string,
    start_year: string,
    end_year: string,
    is_current: boolean,
    jobdescription: string,
    location: string,
    employment_type: string,
    experience_id: number,
) => {
    try {
        const response = await axiosInstance.put(
            `/users/editExperience/${experience_id}`,
            {
                jobtitle,
                company,
                start_year,
                end_year: is_current ? null : end_year,
                is_current,
                jobdescription,
                location,
                employment_type,
            },
        );

        console.log("EDITED: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error editing work experience record");
        throw error;
    }
};

export const saveResume = async (resumeData: FormData, clerkid: string) => {
    try {
        const response = await axiosInstance.put(
            `/users/saveResume/${clerkid}`,
            resumeData,
        );
        return response.data;
    } catch (error) {
        console.error("Error uploadting resume: ", error);
        throw error;
    }
};

export const deleteResume = async (clerkid: string) => {
    try {
        const response = await axiosInstance.put(
            `/users/deleteResume/${clerkid}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error deleting resume");
        throw error;
    }
};

export const getStudentSkills = async (clerkid: string) => {
    try {
        const response = await axiosInstance.get(`/users/getSkills/${clerkid}`);
        console.log("Skills Fetched: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error getting student skills");
        throw error;
    }
};

export const addNewSkill = async (clerkid: string, name: string) => {
    try {
        const response = await axiosInstance.post(
            `/users/addSkill/${clerkid}`,
            { name },
        );
        console.log("ADDED: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error adding new skill: ", error);
        throw error;
    }
};

export const removeSkill = async (id: number) => {
    try {
        const response = await axiosInstance.delete(`/users/removeSkill/${id}`);
        console.log("DELETED: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error removing student skills");
        throw error;
    }
};

export const getLanguages = async (clerkid: string) => {
    try {
        const response = await axiosInstance.get(
            `/users/getLanguages/${clerkid}`,
        );
        console.log("GET LANGUAGES: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error getting languages");
        throw error;
    }
};

export const addLanguage = async (
    clerkid: string,
    language: string,
    proficiency: string,
) => {
    try {
        const response = await axiosInstance.post(
            `/users/addLanguage/${clerkid}`,
            { language, proficiency },
        );
        console.log("ADDED LANGUAGE: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error adding language");
        throw error;
    }
};

export const deleteLanguage = async (id: number) => {
    try {
        const response = await axiosInstance.delete(
            `/users/deleteLanguage/${id}`,
        );
        console.log("DELETED LANGUAGE: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error deleting language");
        throw error;
    }
};

export const updateCompanyProfile = async (
    company_name: string,
    industry: string,
    company_size: string,
    founded_year: number,
    website: string,
    location: string,
    company_id: string,
) => {
    try {
        const response = await axiosInstance.put(
            `/users/updateCompanyProfile/${company_id}`,
            {
                company_name,
                industry,
                company_size,
                founded_year,
                website,
                location,
            },
        );

        console.log("Company profile update status: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating company profile");
        throw error;
    }
};

export const getCompanyProfile = async (companyid: string) => {
    try {
        const response = await axiosInstance.get(
            `/users/getCompanyProfile/${companyid}`,
        );
        console.log("Company profile: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching company profile");
        throw error;
    }
};

export const updateCompanyDesciption = async (
    description: string,
    companyid: string,
) => {
    try {
        const response = await axiosInstance.put(
            `/users/updateDescription/${companyid}`,
            { description },
        );
        console.log("Company description upd status: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating company description");
        throw error;
    }
};

export const getAllStudent = async () => {
    try {
        const response = await axiosInstance.get("/users/getAllStudent");
        return response.data;
    } catch (error) {
        console.error("Failed to get all students");
        throw error;
    }
};
