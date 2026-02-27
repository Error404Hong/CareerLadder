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
