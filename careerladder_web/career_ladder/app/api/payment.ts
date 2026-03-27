import axiosInstance from "./config";

export const createCheckoutSession = async (
    clerkid: string,
    amount: number,
    description: string,
    payment_type: string,
    project_id?: string,
    application_id?: string,
) => {
    try {
        const response = await axiosInstance.post(
            "/payment/createCheckoutSession",
            {
                clerkid,
                amount,
                description,
                payment_type,
                project_id,
                application_id,
            },
        );
        return response.data;
    } catch (error) {
        console.error("Error creating checkout session: ", error);
        throw error;
    }
};

export const createProjectPayment = async (
    application_id: string,
    project_id: string,
    company_id: string,
    student_id: string,
    total_amount: number,
    monthly_allowance: number,
    duration_months: number,
) => {
    try {
        const response = await axiosInstance.post(
            "/payment/createProjectPayment",
            {
                application_id,
                project_id,
                company_id,
                student_id,
                total_amount,
                monthly_allowance,
                duration_months,
            },
        );
        return response.data;
    } catch (error) {
        console.error("Error creating project payment: ", error);
        throw error;
    }
};

export const calculatePayable = async (projectid: string) => {
    try {
        const response = await axiosInstance.get(
            `/payment/calculatePayable/${projectid}`,
        );
        console.log("Calculated: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error calculating total payable: ", error);
        throw error;
    }
};

export const getPaymentsByCompany = async (companyId: string) => {
    try {
        const response = await axiosInstance.get(
            `/payment/getByCompany/${companyId}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching payments: ", error);
        throw error;
    }
};

export const getPaymentStats = async (companyId: string) => {
    try {
        const response = await axiosInstance.get(
            `/payment/getStats/${companyId}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching payment stats: ", error);
        throw error;
    }
};

export const getPaymentsByStudent = async (studentId: string) => {
    try {
        const response = await axiosInstance.get(
            `/payment/getByStudent/${studentId}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching payments: ", error);
        throw error;
    }
};

export const updatePaymentStatus = async (id: string, status: string) => {
    try {
        const response = await axiosInstance.put(
            `/payment/updateStatus/${id}`,
            { status },
        );
        return response.data;
    } catch (error) {
        console.error("Error updating payment status: ", error);
        throw error;
    }
};
