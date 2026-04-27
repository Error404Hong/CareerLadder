import axiosInstance from "./config";

export const getBadges = async () => {
    try {
        const response = await axiosInstance.get("/rewards/badges");
        return response.data;
    } catch (error) {
        console.error("Error fetching badges: ", error);
        throw error;
    }
};

export const addBadge = async (
    name: string,
    description: string,
    icon: string,
) => {
    try {
        const response = await axiosInstance.post("/rewards/badges", {
            name,
            description,
            icon,
        });
        return response.data;
    } catch (error) {
        console.error("Error adding badge: ", error);
        throw error;
    }
};

export const updateBadge = async (
    id: string,
    name: string,
    description: string,
    icon: string,
) => {
    try {
        const response = await axiosInstance.put(`/rewards/badges/${id}`, {
            name,
            description,
            icon,
        });
        return response.data;
    } catch (error) {
        console.error("Error updating badge: ", error);
        throw error;
    }
};

export const deleteBadge = async (id: string) => {
    try {
        const response = await axiosInstance.delete(`/rewards/badges/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting badge: ", error);
        throw error;
    }
};

export const getBadgesByStudent = async (studentId: string) => {
    try {
        const response = await axiosInstance.get(
            `/rewards/badges/student/${studentId}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching student badges: ", error);
        throw error;
    }
};

export const awardBadge = async (
    studentId: string,
    badgeid: string,
    projectid: string,
    awardedby: string,
) => {
    try {
        const response = await axiosInstance.post(
            `/rewards/badges/award/${studentId}`,
            {
                badgeid,
                projectid,
                awardedby,
            },
        );
        return response.data;
    } catch (error) {
        console.error("Error awarding badge: ", error);
        throw error;
    }
};

export const issueCertification = async (
    studentId: string,
    projectid: string,
    employerid: string,
    certificationFile?: File,
) => {
    try {
        const formData = new FormData();
        formData.append("projectid", projectid);
        formData.append("employerid", employerid);
        if (certificationFile) formData.append("certification", certificationFile);

        const response = await axiosInstance.post(
            `/rewards/certifications/${studentId}`,
            formData,
        );
        return response.data;
    } catch (error) {
        console.error("Error issuing certification: ", error);
        throw error;
    }
};

export const getStudentCertifications = async (studentId: string) => {
    try {
        const response = await axiosInstance.get(
            `/rewards/certifications/${studentId}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching certifications: ", error);
        throw error;
    }
};

export const awardExperiencePoints = async (
    studentId: string,
    exppoints: number,
) => {
    try {
        const response = await axiosInstance.post(`/rewards/exp/${studentId}`, {
            exppoints,
        });
        return response.data;
    } catch (error) {
        console.error("Error awarding experience points: ", error);
        throw error;
    }
};

export const getStudentExpPoints = async (studentId: string) => {
    try {
        const response = await axiosInstance.get(`/rewards/exp/${studentId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching experience points: ", error);
        throw error;
    }
};
