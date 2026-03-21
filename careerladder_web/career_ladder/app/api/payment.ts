import axiosInstance from "./config";

export const createCheckoutSession = async (
    clerkid: string,
    amount: number,
    description: string,
) => {
    try {
        const response = await axiosInstance.post(
            "/payment/createCheckoutSession",
            {
                clerkid,
                amount,
                description,
            },
        );
        console.log("Checkout Session: ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creatinf checkout session: ", error);
        throw error;
    }
};
