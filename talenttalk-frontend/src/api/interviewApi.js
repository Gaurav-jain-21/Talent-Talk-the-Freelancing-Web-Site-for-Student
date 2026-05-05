import api from "./axios";

export const createInterview = (data) => api.post("/interview/create", data);
export const startInterview = (interviewId) =>
  api.post(`/interview/${interviewId}/start`);
export const getNextQuestion = (interviewId) =>
  api.get(`/interview/${interviewId}/next-question`);
export const submitAnswer = (data) => api.post("/interview/answer", data);
export const getResult = (interviewId) =>
  api.get(`/interview/${interviewId}/result`);
export const getStudentInterviews = (studentId) =>
  api.get(`/interview/student/${studentId}`);
export const getCompanyInterviews = (companyId) =>
  api.get(`/interview/company/${companyId}`);
export const getPendingInterviews = (studentId) =>
  api.get(`/interview/student/${studentId}/pending`);
