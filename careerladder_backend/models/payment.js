const stripe = require("../config/stripe");

class Payment {
    static async createCheckoutSession(clerkid, amount, description) {
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card", "fpx"],
                line_items: [
                    {
                        price_data: {
                            currency: "myr",
                            product_data: {
                                name: description,
                            },
                            unit_amount: amount * 100,
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
                metadata: { clerkid },
            });
            return session;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Payment;
