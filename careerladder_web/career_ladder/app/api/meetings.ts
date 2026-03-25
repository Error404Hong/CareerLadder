import axiosInstance from "./config";

export const scheduleMeeting = async (
    application_id: string | null,
    company_id: string,
    applicant_id: string,
    title: string,
    description: string,
    meeting_type: string,
    reference_type: string,
    reference_id: string,
    scheduled_at: string,
    duration: number,
) => {
    try {
        const response = await axiosInstance.post("/meetings/scheduleMeeting", {
            application_id,
            company_id,
            applicant_id,
            title,
            description,
            meeting_type,
            reference_type,
            reference_id,
            scheduled_at,
            duration,
        });
        return response.data;
    } catch (error) {
        console.error("Error scheduling meeting: ", error);
        throw error;
    }
};

export const getStreamToken = async (userId: string) => {
    try {
        const response = await axiosInstance.get(
            `/meetings/getToken/${userId}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error getting stream token: ", error);
        throw error;
    }
};

export const getMeetingByApplication = async (applicationId: string) => {
    try {
        const response = await axiosInstance.get(
            `/meetings/getByApplication/${applicationId}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching meeting: ", error);
        throw error;
    }
};

export const getMeetingsByCompany = async (companyId: string) => {
    try {
        const response = await axiosInstance.get(
            `/meetings/getByCompany/${companyId}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching meetings: ", error);
        throw error;
    }
};

export const getMeetingsByApplicant = async (applicantId: string) => {
    try {
        const response = await axiosInstance.get(
            `/meetings/getByApplicant/${applicantId}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching meetings: ", error);
        throw error;
    }
};

export const updateMeetingStatus = async (id: string, status: string) => {
    try {
        const response = await axiosInstance.put(
            `/meetings/updateStatus/${id}`,
            { status },
        );
        return response.data;
    } catch (error) {
        console.error("Error updating meeting status: ", error);
        throw error;
    }
};

export const deleteMeeting = async (id: string) => {
    try {
        const response = await axiosInstance.delete(
            `/meetings/deleteMeeting/${id}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error deleting meeting: ", error);
        throw error;
    }
};

export const getMeetingByRoomName = async (roomName: string) => {
    try {
        const response = await axiosInstance.get(
            `/meetings/getByRoomName/${roomName}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching meeting by room name: ", error);
        throw error;
    }
};
