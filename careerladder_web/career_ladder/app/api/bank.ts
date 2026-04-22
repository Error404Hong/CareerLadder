import axiosInstance from "./config";

export const getBankAccounts = async (studentid: string) => {
    try {
        const response = await axiosInstance.get(
            `/bank/getBankAcc/${studentid}`,
        );
        return response.data;
    } catch (error) {
        console.error("Failed to fetch student bank accs");
        throw error;
    }
};

export const addBankAccount = async (
    studentid: string,
    bank_name: string,
    account_number: string,
    account_holder_name: string,
    is_default: boolean,
) => {
    try {
        const response = await axiosInstance.post(
            `/bank/addBankAcc/${studentid}`,
            { bank_name, account_number, account_holder_name, is_default },
        );

        return response.data;
    } catch (error) {
        console.error("Failed to add new bank account");
        throw error;
    }
};

export const deleteBankAccount = async (id: string, studentid: string) => {
    try {
        const response = await axiosInstance.delete(
            `/bank/deleteBank/${id}/${studentid}`,
        );
        return response.data;
    } catch (error) {
        console.error("Failed to delete bank account");
        throw error;
    }
};

export const setDefault = async (id: string, studentid: string) => {
    try {
        const response = await axiosInstance.put(
            `/bank/setDefault/${id}/${studentid}`,
        );
        return response.data;
    } catch (error) {
        console.error("Failed to set bank as default");
        throw error;
    }
};
