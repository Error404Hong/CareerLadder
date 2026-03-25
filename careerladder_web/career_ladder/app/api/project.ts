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

export const getCompanyProjects = async (companyid: string) => {
    try {
        const response = await axiosInstance.get(
            `/projects/getCompanyProjects/${companyid}`,
        );
        console.log("Company Projects: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching company projects: ", error);
        throw error;
    }
};

export const deleteCompanyProjects = async (projectid: string) => {
    try {
        const response = await axiosInstance.delete(
            `/projects/deleteCompanyProjects/${projectid}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error deleting company projects: ", error);
        throw error;
    }
};

export const createProject = async (
    company_id: string,
    title: string,
    description: string,
    skills_required: string[],
    duration: string,
    allowance: number,
    vacancies: number,
    start_date: string,
    end_date: string,
) => {
    try {
        const response = await axiosInstance.post("/projects/createProject", {
            company_id,
            title,
            description,
            skills_required,
            duration,
            allowance,
            vacancies,
            start_date,
            end_date,
        });
        return response.data;
    } catch (error) {
        console.error("Error creating project: ", error);
        throw error;
    }
};

export const getProjectById = async (id: string) => {
    try {
        const response = await axiosInstance.get(
            `/projects/getProjectById/${id}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching project: ", error);
        throw error;
    }
};

export const updateProject = async (
    id: string,
    title: string,
    description: string,
    skills_required: string[],
    duration: string,
    allowance: number,
    vacancies: number,
    start_date: string,
    end_date: string,
    status: string,
) => {
    try {
        const response = await axiosInstance.put(
            `/projects/updateProject/${id}`,
            {
                title,
                description,
                skills_required,
                duration,
                allowance,
                vacancies,
                start_date,
                end_date,
                status,
            },
        );
        return response.data;
    } catch (error) {
        console.error("Error updating project: ", error);
        throw error;
    }
};

export const getProjectApplicationsById = async (id: string) => {
    try {
        const response = await axiosInstance.get(
            `/projects/getProjectApplications/${id}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching project applications: ", error);
        throw error;
    }
};

export const getProjectAppByCom = async (companyid: string) => {
    try {
        const response = await axiosInstance.get(
            `/projects/getProjectAppByCom/${companyid}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching project applications: ", error);
        throw error;
    }
};

export const updateProjectVacancies = async (projectid: string) => {
    try {
        const response = await axiosInstance.put(
            `/projects/updateProjectVacancies/${projectid}`,
        );
        console.log("UPDATED VACANCIES: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating project vacancies");
        throw error;
    }
};

export const updateProjectStatus = async (
    projectid: string,
    status: string,
) => {
    try {
        const response = await axiosInstance.put(
            `/projects/updateProjectStatus/${projectid}`,
            {
                status,
            },
        );

        return response.data;
    } catch (error) {
        console.error("Error updating project status");
        throw error;
    }
};
