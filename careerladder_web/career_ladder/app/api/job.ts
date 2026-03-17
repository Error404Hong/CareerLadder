import axiosInstance from "./config";

export const getAllJobs = async () => {
    try {
        const response = await axiosInstance.get("/jobs/getAllJobs");
        console.log("All Jobs: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch all jobs");
        throw error;
    }
};

export const applyJob = async (applicationData: FormData) => {
    try {
        const response = await axiosInstance.post(
            "/jobs/applyJobs",
            applicationData,
        );
        console.log("Application for job: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to apply for jobs");
        throw error;
    }
};
