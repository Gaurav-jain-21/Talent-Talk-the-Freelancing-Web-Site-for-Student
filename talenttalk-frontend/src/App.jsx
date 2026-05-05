import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import JobList from "./pages/student/JobList";
import JobDetail from "./pages/student/JobDetail";
import MyApplications from "./pages/student/MyApplications";
import StudentChat from "./pages/student/Chat";
import Interview from "./pages/student/Interview";
import StudentPayments from "./pages/student/Payments";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyProfile from "./pages/company/CompanyProfile";
import MyJobs from "./pages/company/MyJobs";
import PostJob from "./pages/company/PostJob";
import JobApplicants from "./pages/company/JobApplicants";
import StudentList from "./pages/company/StudentList";
import StudentDetail from "./pages/company/StudentDetail";
import CompanyChat from "./pages/company/Chat";
import InterviewResults from "./pages/company/InterviewResults";
import CompanyPayments from "./pages/company/Payments";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageCompanies from "./pages/admin/ManageCompanies";
import ManageJobs from "./pages/admin/ManageJobs";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
