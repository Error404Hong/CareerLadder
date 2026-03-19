import axiosInstance from "./config";

export const getAllTraining = async () => {
    try {
        const response = await axiosInstance.get("/training/getAllTraining");
        console.log("All Training: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch training programs");
        throw error;
    }
};

export const registerTraining = async (clerkid: string, trainingid: string) => {
    try {
        const response = await axiosInstance.post("/training/register", {
            clerkid,
            trainingid,
        });
        return response.data;
    } catch (error) {
        console.error("Error registering for training: ", error);
        throw error;
    }
};

export const getTrainingRegistrations = async (clerkid: string) => {
    try {
        const response = await axiosInstance.get(
            `/training/getTrainingReg/${clerkid}`,
        );
        console.log("Registered Training: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching training registrations: ", error);
        throw error;
    }
};
