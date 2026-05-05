import api from "./axios";

export const createProfile = (data) => api.post("/student/profile", data);
export const updateProfile = (userId, data) =>
  api.put(`/student/profile/${userId}`, data);
export const getProfile = (userId) => api.get(`/student/profile/${userId}`);
export const getAllStudents = () => api.get("/student/all");
export const uploadResume = (userId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`/student/profile/${userId}/resume`, formData);
};
export const updateWorkStatus = (userId, status) =>
  api.patch(`/student/profile/${userId}/status?status=${status}`);
export const addProject = (studentId, data) =>
  api.post(`/student/profile/${studentId}/project`, data);
export const getProjects = (studentId) =>
  api.get(`/student/profile/${studentId}/projects`);
