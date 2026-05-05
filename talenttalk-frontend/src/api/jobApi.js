import api from './axios'

export const getAllJobs = () => api.get('/job/all')
export const getJobById = (jobId) => api.get(`/job/${jobId}`)
export const postJob = (data) => api.post('/job/post', data)
export const getCompanyJobs = (companyId) => api.get(`/job/company/${companyId}`)
export const applyToJob = (data) => api.post('/job/apply', data)
export const getJobApplications = (jobId) => api.get(`/job/${jobId}/applications`)
export const getStudentApplications = (studentId) => api.get(`/job/student/${studentId}`)
export const updateApplicationStatus = (applicationId, status) =>
  api.patch(`/job/application/${applicationId}/status?status=${status}`)
export const withdrawApplication = (applicationId) =>
  api.patch(`/job/application/${applicationId}/withdraw`)
export const closeJob = (jobId) => api.patch(`/job/${jobId}/close`)
export const deleteJob = (jobId) => api.delete(`/job/${jobId}/delete`)