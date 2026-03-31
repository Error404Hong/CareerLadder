import axiosInstance from "./config";

export const getChatToken = async (userId: string) => {
    try {
        const response = await axiosInstance.get(`/chat/getToken/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error getting chat token: ", error);
        throw error;
    }
};

export const createChannel = async (companyid: string, studentid: string) => {
    try {
        const response = await axiosInstance.post(`/chat/createChannel`, {
            companyid,
            studentid,
        });
        return response.data;
    } catch (error) {
        console.error("Error creating channel: ", error);
        throw error;
    }
};
