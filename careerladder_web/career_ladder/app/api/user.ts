import axiosInstance from "./config";

export const addNewUser = async (clerkid: string, role: number) => {
    try {
        const response = await axiosInstance.post("/users/addNewUser", {
            clerkid,
            role,
        });

        console.log("User Added:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error Adding New User: ", error);
        throw error;
    }
};

export const getUserById = async (clerkid: string) => {
    try {
        const response = await axiosInstance.get(`/users/getUser/${clerkid}`);

        console.log("User Fetched: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error Getting User: ", error);
        throw error;
    }
};

export const getStudentProfile = async (clerkid: string) => {
    try {
        const response = await axiosInstance.get(
            `/users/getProfile/${clerkid}`,
        );

        console.log("Student Profile: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error Fetching Student Profile: ", error);
        throw error;
    }
};

export const modifyUserProfile = async (
    linkedin_url: string,
    location: string,
    major: string,
    job_preference: string,
    work_status: boolean,
    clerkid: string,
) => {
    try {
        const response = await axiosInstance.put(
            `/users/modifyUser/${clerkid}`,
            {
                linkedin_url,
                location,
                major,
                job_preference,
                work_status,
            },
        );

        console.log("User Profile Modified: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error Modifying User Profile: ", error);
        throw error;
    }
};
