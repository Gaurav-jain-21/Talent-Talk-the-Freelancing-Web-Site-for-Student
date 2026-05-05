import api from "./axios";

export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const verifyEmail = (token) => api.get(`/auth/verify?token=${token}`);
export const resendVerification = (email) =>
  api.post(`/auth/resend-verification?email=${email}`);
