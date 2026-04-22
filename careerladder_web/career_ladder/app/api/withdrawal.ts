import axiosInstance from "./config";

export const getAvailableBalance = async (studentid: string) => {
    try {
        const response = await axiosInstance.get(
            `/withdrawal/getBalance/${studentid}`,
        );
        return response.data;
    } catch (error) {
        console.error("Failed to get student balance");
        throw error;
    }
};

export const requestWithdrawal = async (
    bankid: string,
    studentid: string,
    amount: number,
) => {
    try {
        const response = await axiosInstance.post(
            `/withdrawal/request/${bankid}/${studentid}`,
            {
                amount,
            },
        );
        return response.data;
    } catch (error) {
        console.error("Failed to request withdrawal");
        throw error;
    }
};

export const getWithdrawalRequestByStudent = async (studentid: string) => {
    try {
        const response = await axiosInstance.get(
            `/withdrawal/getStudentRequests/${studentid}`,
        );
        return response.data;
    } catch (error) {
        console.error("Failed to get student withdrawal request");
        throw error;
    }
};

export const getAllWithdrawalRequest = async () => {
    try {
        const response = await axiosInstance.get("/withdrawal/getAll");
        return response.data;
    } catch (error) {
        console.error("Failed to get all withdrawal request");
        throw error;
    }
};

export const approveRequest = async (id: string) => {
    try {
        const response = await axiosInstance.put(`/withdrawal/approve/${id}`);
        return response.data;
    } catch (error) {
        console.error("Failed to approve withdrawal request");
        throw error;
    }
};

export const rejectRequest = async (id: string, note: string) => {
    try {
        const response = await axiosInstance.put(`/withdrawal/reject/${id}`, {
            note,
        });
        return response.data;
    } catch (error) {
        console.error("Failed to reject withdrawal request");
        throw error;
    }
};

export const completeRequest = async (id: string) => {
    try {
        const response = await axiosInstance.put(`/withdrawal/complete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Failed to complete  withdrawal request");
        throw error;
    }
};
