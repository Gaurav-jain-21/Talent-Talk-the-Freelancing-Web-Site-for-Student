import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const StudentProfile = lazy(() => import("./pages/student/StudentProfile"));
const JobList = lazy(() => import("./pages/student/JobList"));
const JobDetail = lazy(() => import("./pages/student/JobDetail"));
const MyApplications = lazy(() => import("./pages/student/MyApplications"));
const StudentChat = lazy(() => import("./pages/student/Chat"));
const Interview = lazy(() => import("./pages/student/Interview"));
const StudentPayments = lazy(() => import("./pages/student/Payments"));

const CompanyDashboard = lazy(() => import("./pages/company/CompanyDashboard"));
const CompanyProfile = lazy(() => import("./pages/company/CompanyProfile"));
const MyJobs = lazy(() => import("./pages/company/MyJobs"));
const PostJob = lazy(() => import("./pages/company/PostJob"));
const JobApplicants = lazy(() => import("./pages/company/JobApplicants"));
const StudentList = lazy(() => import("./pages/company/StudentList"));
const StudentDetail = lazy(() => import("./pages/company/StudentDetail"));
const CompanyChat = lazy(() => import("./pages/company/Chat"));
const InterviewResults = lazy(() => import("./pages/company/InterviewResults"));
const CompanyPayments = lazy(() => import("./pages/company/Payments"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageStudents = lazy(() => import("./pages/admin/ManageStudents"));
const ManageCompanies = lazy(() => import("./pages/admin/ManageCompanies"));
const ManageJobs = lazy(() => import("./pages/admin/ManageJobs"));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div style={{ padding: 16 }}>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/jobs"
            element={
              <ProtectedRoute role="STUDENT">
                <JobList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/jobs/:jobId"
            element={
              <ProtectedRoute role="STUDENT">
                <JobDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/applications"
            element={
              <ProtectedRoute role="STUDENT">
                <MyApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/chat"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/interview/:interviewId"
            element={
              <ProtectedRoute role="STUDENT">
                <Interview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/payments"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentPayments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/dashboard"
            element={
              <ProtectedRoute role="COMPANY">
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/profile"
            element={
              <ProtectedRoute role="COMPANY">
                <CompanyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/jobs"
            element={
              <ProtectedRoute role="COMPANY">
                <MyJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/jobs/post"
            element={
              <ProtectedRoute role="COMPANY">
                <PostJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/jobs/:jobId/applicants"
            element={
              <ProtectedRoute role="COMPANY">
                <JobApplicants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/students"
            element={
              <ProtectedRoute role="COMPANY">
                <StudentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/students/:userId"
            element={
              <ProtectedRoute role="COMPANY">
                <StudentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/chat"
            element={
              <ProtectedRoute role="COMPANY">
                <CompanyChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/interviews"
            element={
              <ProtectedRoute role="COMPANY">
                <InterviewResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/payments"
            element={
              <ProtectedRoute role="COMPANY">
                <CompanyPayments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute role="ADMIN">
                <ManageStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/companies"
            element={
              <ProtectedRoute role="ADMIN">
                <ManageCompanies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jobs"
            element={
              <ProtectedRoute role="ADMIN">
                <ManageJobs />
              </ProtectedRoute>
            }
          />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
