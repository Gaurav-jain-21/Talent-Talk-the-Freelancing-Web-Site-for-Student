import api from "./axios";

export const createOrder = (data) => api.post("/payment/create", data);
export const verifyPayment = (data) => api.post("/payment/verify", data);
export const getCompanyPayments = (companyId) =>
  api.get(`/payment/company/${companyId}`);
export const getStudentPayments = (studentId) =>
  api.get(`/payment/student/${studentId}`);
