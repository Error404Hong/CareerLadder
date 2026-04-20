import axiosInstance from "./config";

export const getAllJobs = async () => {
    try {
        const response = await axiosInstance.get("/jobs/getAllJobs");
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
        return response.data;
    } catch (error) {
        console.error("Failed to apply for jobs");
        throw error;
    }
};

export const getJobApplications = async (clerkid: string) => {
    try {
        const response = await axiosInstance.get(
            `/jobs/getUsersJobApplications/${clerkid}`,
        );
        console.log("Job Application: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching job applications: ", error);
        throw error;
    }
};

export const getJobsByCompany = async (companyid: string) => {
    try {
        const response = await axiosInstance.get(
            `/jobs/getJobsByCompany/${companyid}`,
        );
        console.log("Job data: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error getting job listings: ", error);
        throw error;
    }
};

export const createJob = async (
    company_id: string,
    title: string,
    description: string,
    requirements: string,
    skills_required: string[],
    employment_type: string,
    salary_min: number,
    salary_max: number,
    location: string,
    is_remote: boolean,
    vacancies: number,
) => {
    try {
        const response = await axiosInstance.post("/jobs/createJob", {
            company_id,
            title,
            description,
            requirements,
            skills_required,
            employment_type,
            salary_min,
            salary_max,
            location,
            is_remote,
            vacancies,
        });
        return response.data;
    } catch (error) {
        console.error("Error creating job: ", error);
        throw error;
    }
};

export const deleteJob = async (id: string) => {
    try {
        const response = await axiosInstance.delete(`/jobs/deleteJob/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting job: ", error);
        throw error;
    }
};

export const getJobById = async (id: string) => {
    try {
        const response = await axiosInstance.get(`/jobs/getJob/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting job: ", error);
        throw error;
    }
};

export const updateJob = async (
    id: string,
    title: string,
    description: string,
    requirements: string,
    skills_required: string[],
    employment_type: string,
    salary_min: number,
    salary_max: number,
    location: string,
    is_remote: boolean,
    vacancies: number,
) => {
    try {
        const response = await axiosInstance.put(`/jobs/updateJob/${id}`, {
            title,
            description,
            requirements,
            skills_required,
            employment_type,
            salary_min,
            salary_max,
            location,
            is_remote,
            vacancies,
        });
        return response.data;
    } catch (error) {
        console.error("Error updating job: ", error);
        throw error;
    }
};

export const getJobApplicationsById = async (id: string) => {
    try {
        const response = await axiosInstance.get(
            `/jobs/getJobApplications/${id}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching job applications: ", error);
        throw error;
    }
};

export const getApplicantsProfile = async (id: string) => {
    try {
        const response = await axiosInstance.get(
            `/jobs/getApplicantsProfile/${id}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching application: ", error);
        throw error;
    }
};

export const updateApplicationStatus = async (id: string, status: string) => {
    try {
        const response = await axiosInstance.put(
            `/jobs/updateApplicationStatus/${id}`,
            { status },
        );
        return response.data;
    } catch (error) {
        console.error("Error updating application status: ", error);
        throw error;
    }
};

export const getAllJobAppByCom = async (companyid: string) => {
    try {
        const response = await axiosInstance.get(
            `/jobs/getJobsAppByCom/${companyid}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching job applications by company");
        throw error;
    }
};

export const updateJobVacancies = async (jobid: string) => {
    try {
        const response = await axiosInstance.put(
            `/jobs/updateJobVacancies/${jobid}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error updating job vacancies");
        throw error;
    }
};

export const updateJobStatus = async (jobid: string, status: string) => {
    try {
        const response = await axiosInstance.put(
            `/jobs/updateJobStatus/${jobid}`,
            {
                status,
            },
        );

        return response.data;
    } catch (error) {
        console.error("Error updating job status");
        throw error;
    }
};
