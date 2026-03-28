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

export const getCompanyTrainingPrograms = async (companyid: string) => {
    try {
        const response = await axiosInstance.get(
            `/training/getCompanyTrainings/${companyid}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching company trainings: ", error);
        throw error;
    }
};

export const createNewTrainingProgram = async (
    company_id: string,
    title: string,
    description: string,
    prerequisites: string,
    expected_outcome: string,
    location: string,
    date: string,
    time: string,
    duration: string,
    vacancies: number,
    is_public: boolean,
    application_deadline: string,
) => {
    try {
        const response = await axiosInstance.post("/training/createProgram", {
            company_id,
            title,
            description,
            prerequisites,
            expected_outcome,
            location,
            date,
            time,
            duration,
            vacancies,
            is_public,
            application_deadline,
        });

        return response.data;
    } catch (error) {
        console.error("Error creating new training program");
        throw error;
    }
};

export const getProgramById = async (programid: string) => {
    try {
        const response = await axiosInstance.get(
            `/training/getProgramById/${programid}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error creating fetch training program");
        throw error;
    }
};

export const updateProgramById = async (
    title: string,
    description: string,
    prerequisites: string,
    expected_outcome: string,
    location: string,
    date: string,
    time: string,
    duration: string,
    vacancies: number,
    is_public: boolean,
    application_deadline: string,
    status: string,
    id: string,
) => {
    try {
        const response = await axiosInstance.put(
            `/training/updateProgramById/${id}`,
            {
                title,
                description,
                prerequisites,
                expected_outcome,
                location,
                date,
                time,
                duration,
                vacancies,
                is_public,
                application_deadline,
                status,
            },
        );

        return response.data;
    } catch (error) {
        console.error("Error creating update training program");
        throw error;
    }
};

export const deleteProgramById = async (programid: string) => {
    try {
        const response = await axiosInstance.delete(
            `/training/deleteProgram/${programid}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error deleting training program");
        throw error;
    }
};

export const getProgramRegistration = async (programid: string) => {
    try {
        const response = await axiosInstance.get(
            `/training/getProgramRegistration/${programid}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching program registration");
        throw error;
    }
};
