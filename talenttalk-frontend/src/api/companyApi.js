import api from './axios'

export const createProfile = (data) => api.post('/company/profile', data)
export const updateProfile = (userId, data) => api.put(`/company/profile/${userId}`, data)
export const getProfile = (userId) => api.get(`/company/profile/${userId}`)
export const getAllCompanies = () => api.get('/company/all')
export const getStudentProfile = (userId) => api.get(`/company/students/${userId}`)
export const getMyJobs = (companyId) => api.get(`/company/${companyId}/jobs`)
export const getApplicants = (jobId) => api.get(`/company/jobs/${jobId}/applicants`)
export const updateApplicationStatus = (applicationId, status) =>
  api.patch(`/company/application/${applicationId}/status?status=${status}`)