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
