import api from './axios'

export const getDashboard = () => api.get('/admin/dashboard')
export const getAllStudents = () => api.get('/admin/students')
export const getAllCompanies = () => api.get('/admin/companies')
export const getAllJobs = () => api.get('/admin/jobs')
export const getPayments = (companyId) =>
  api.get(`/admin/payments/${companyId}`)
export const deleteJob = (jobId) => api.delete(`/admin/jobs/${jobId}`)
export const closeJob = (jobId) => api.patch(`/admin/jobs/${jobId}/close`)