import axiosInstance from "./config";

export const getAllProjects = async () => {
    try {
        const response = await axiosInstance.get("/projects/getAllProjects");
        console.log("Project Fetched: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching projects: ", error);
        throw error;
    }
};
