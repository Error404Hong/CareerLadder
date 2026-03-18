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

export const applyProjects = async (applicationData: FormData) => {
    try {
        const response = await axiosInstance.post(
            "/projects/applyProjects",
            applicationData,
        );
        console.log("Application for project: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error applying for project");
        throw error;
    }
};

export const getProjectApplications = async (clerkid: string) => {
    try {
        const response = await axiosInstance.get(
            `/projects/getUsersProjectApplications/${clerkid}`,
        );
        console.log("Project Application: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching project applications: ", error);
        throw error;
    }
};
