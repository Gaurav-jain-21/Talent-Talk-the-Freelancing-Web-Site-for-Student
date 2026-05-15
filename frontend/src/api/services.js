import { api } from "./client";

const data = (request) => request.then((response) => response.data);
const numberOrNull = (value) =>
  value === "" || value === undefined || value === null ? null : Number(value);
const csv = (value) => (Array.isArray(value) ? value.join(", ") : value || "");

function studentProfilePayload(payload = {}) {
  return {
    userId: numberOrNull(payload.userId),
    fullName: payload.fullName || payload.name || payload.studentName || "",
    email: payload.email || "",
    phone: payload.phone || null,
    college: payload.college || "",
    degree: payload.degree || "",
    graduationYear: Number(payload.graduationYear || new Date().getFullYear()),
    bio: payload.bio || "",
    skills: csv(payload.skills),
    resumeUrl: payload.resumeUrl || null,
    githubUrl: payload.githubUrl || null,
    linkedinUrl: payload.linkedinUrl || null,
    workStatus: payload.workStatus || "OPEN_TO_WORK",
  };
}

function jobPayload(payload = {}) {
  return {
    companyId: numberOrNull(payload.companyId),
    companyName: payload.companyName || payload.company || "",
    title: payload.title || payload.jobTitle || "",
    description: payload.description || "",
    location: payload.location || "",
    salary: payload.salary || "",
    skillsRequired: csv(payload.skillsRequired || payload.skills),
    jobType: payload.jobType || payload.type || "Internship",
    openings: Number(payload.openings || 1),
    lastDateToApply: payload.lastDateToApply || payload.lastDate || "",
  };
}

export const authApi = {
  login: (payload) => data(api.post("/auth/login", payload)),
  register: (payload) =>
    data(
      api.post("/auth/register", {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        role: payload.role,
      }),
    ),
  changePassword: (payload) => data(api.post("/auth/change-password", payload)),
  forgotPassword: (payload) => data(api.post("/auth/forgot-password", payload)),
  resetPassword: (payload) => data(api.post("/auth/reset-password", payload)),
  validate: (token) =>
    data(
      api.get("/auth/validate", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ),
};

export const jobApi = {
  all: () => data(api.get("/job/all")),
  byId: (jobId) => data(api.get(`/job/${jobId}`)),
  byCompany: (companyId) => data(api.get(`/job/company/${companyId}`)),
  apply: (payload) =>
    data(
      api.post("/job/apply", {
        jobId: numberOrNull(payload.jobId),
        studentId: numberOrNull(payload.studentId || payload.userId),
        studentName: payload.studentName || payload.name || "",
        studentEmail: payload.studentEmail || payload.email || "",
      }),
    ),
  studentApplications: (userId) => data(api.get(`/job/student/${userId}`)),
  withdraw: (id) => data(api.post(`/job/application/${id}/withdraw`)),
  updateWorkStatus: (applicationId, workStatus) =>
    data(api.post(`/job/application/${applicationId}/work-status/${workStatus}`)),
  post: (payload) => data(api.post("/job/post", jobPayload(payload))),
  update: (jobId, payload) => data(api.put(`/job/${jobId}`, jobPayload(payload))),
  close: (id) => data(api.post(`/job/${id}/close`)),
  delete: (id) => data(api.delete(`/job/${id}/delete`)),
  applicationsByJob: (jobId) => data(api.get(`/job/${jobId}/applications`)),
};

export const studentApi = {
  createProfile: (payload) =>
    data(api.post("/student/profile", studentProfilePayload(payload))),
  profile: (userId) => data(api.get(`/student/profile/${userId}`)),
  updateProfile: (userId, payload) =>
    data(
      api.put(
        `/student/profile/${userId}`,
        studentProfilePayload({ ...payload, userId }),
      ),
    ),
  uploadResume: (userId, fileOrFormData) => {
    const formData =
      fileOrFormData instanceof FormData ? fileOrFormData : new FormData();
    if (!(fileOrFormData instanceof FormData))
      formData.append("file", fileOrFormData);
    if (
      fileOrFormData instanceof FormData &&
      !formData.has("file") &&
      formData.has("resume")
    ) {
      formData.append("file", formData.get("resume"));
    }
    return data(
      api.post(`/student/profile/${userId}/resume`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    );
  },
  projects: (userId) => data(api.get(`/student/profile/${userId}/projects`)),
  addProject: (userId, payload) =>
    data(api.post(`/student/profile/${userId}/project`, payload)),
  all: () => data(api.get("/student/all")),
  browseJobs: () => data(api.get("/student/jobs")),
  applications: (userId) =>
    data(api.get(`/student/profile/${userId}/applications`)),
  updateApplicationWorkStatus: (applicationId, workStatus) =>
    data(
      api.post(`/student/application/${applicationId}/work-status`, null, {
        params: { workStatus },
      }),
    ),
};

export const companyApi = {
  jobs: (userId) => data(api.get(`/company/${userId}/jobs`)),
  applicants: (jobId) => data(api.get(`/company/jobs/${jobId}/applicants`)),
  updateApplicationStatus: (applicationId, payload) =>
    data(
      api.patch(`/company/application/${applicationId}/status`, null, {
        params: { status: payload.status || payload },
      }),
    ),
  updateWorkStatus: (applicationId, workStatus) =>
    data(
      api.post(`/company/application/${applicationId}/work-status`, null, {
        params: { workStatus },
      }),
    ),
  students: () => data(api.get("/company/students")),
  student: (userId) => data(api.get(`/company/students/${userId}`)),
  profile: (userId) => data(api.get(`/company/profile/${userId}`)),
  createProfile: (payload) => data(api.post("/company/profile", payload)),
  updateProfile: (userId, payload) =>
    data(api.put(`/company/profile/${userId}`, payload)),
};

export const paymentApi = {
  key: () => data(api.get("/payment/key")),
  create: (payload) =>
    data(
      api.post("/payment/create", {
        companyId: numberOrNull(payload.companyId),
        jobId: numberOrNull(payload.jobId),
        studentId: numberOrNull(payload.studentId),
        applicationId: numberOrNull(payload.applicationId),
        companyName: payload.companyName || "",
        studentName: payload.studentName || "",
        jobTitle: payload.jobTitle || "",
        amount: Number(payload.amount || 0),
      }),
    ),
  verify: (payload) => data(api.post("/payment/verify", payload)),
  company: (companyId) => data(api.get(`/payment/company/${companyId}`)),
  student: (studentId) => data(api.get(`/payment/student/${studentId}`)),
  all: () => data(api.get("/payment/all")),
  byId: (paymentId) => data(api.get(`/payment/${paymentId}`)),
};

export const interviewApi = {
  pendingForStudent: (userId) =>
    data(api.get(`/interview/student/${userId}/pending`)),
  company: (userId) => data(api.get(`/interview/company/${userId}`)),
  create: (payload) =>
    data(
      api.post("/interview/create", {
        jobId: numberOrNull(payload.jobId),
        studentId: numberOrNull(payload.studentId),
        companyId: numberOrNull(payload.companyId),
        deadline: payload.deadline || null,
      }),
    ),
  start: (id) => data(api.post(`/interview/${id}/start`)),
  nextQuestion: (id) => data(api.get(`/interview/${id}/next-question`)),
  answer: (payload) => data(api.post("/interview/answer", payload)),
  result: (id) => data(api.get(`/interview/${id}/result`)),
};

export const messageApi = {
  conversation: (id1, id2) =>
    data(api.get(`/message/conversation/${id1}/${id2}`)),
  send: (payload) =>
    data(
      api.post("/message/send", {
        senderId: numberOrNull(payload.senderId),
        receiverId: numberOrNull(payload.receiverId),
        senderName: payload.senderName || payload.name || "",
        content: payload.content || payload.message || "",
      }),
    ),
};

export const adminApi = {
  dashboard: () => data(api.get("/admin/dashboard")),
  students: () => data(api.get("/admin/students")),
  companies: () => data(api.get("/admin/companies")),
  jobs: () => data(api.get("/admin/jobs")),
  payments: () => data(api.get("/admin/payments")),
  closeJob: (id) => data(api.patch(`/admin/jobs/${id}/close`)),
  deleteJob: (id) => data(api.delete(`/admin/jobs/${id}`)),
  deleteStudent: (id) => data(api.delete(`/admin/students/${id}`)),
  deleteCompany: (id) => data(api.delete(`/admin/companies/${id}`)),
};
