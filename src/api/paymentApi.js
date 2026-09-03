import axiosClient from "./axiosClient";

export const paymentApi={
purchasePremium:(cardData) =>axiosClient.post('/Payment/premium/purchase',cardData),

};