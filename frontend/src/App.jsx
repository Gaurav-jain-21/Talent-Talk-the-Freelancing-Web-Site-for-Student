import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import OAuthCallback from "./pages/auth/OAuthCallback";
import StudentDashboard from "./pages/student/StudentDashboard";
import JobList from "./pages/student/JobList";
import StudentProfile from "./pages/student/StudentProfile";
import MyApplications from "./pages/student/MyApplications";
import Works from "./pages/student/Works";
import StudentPayments from "./pages/student/Payments";
import Interview from "./pages/student/Interview";
import Chat from "./pages/Chat";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import Applications from "./pages/company/Applications";
import ApplicationDetail from "./pages/company/ApplicationDetail";
import PostJob from "./pages/company/PostJob";
import MyJobs from "./pages/company/MyJobs";
import JobApplicants from "./pages/company/JobApplicants";
import StudentList from "./pages/company/StudentList";
import StudentDetail from "./pages/company/StudentDetail";
import InterviewResults from "./pages/company/InterviewResults";
import CompanyProfile from "./pages/company/CompanyProfile";
import CompanyPayments from "./pages/company/Payments";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageJobs from "./pages/admin/ManageJobs";
import ManageCompanies from "./pages/admin/ManageCompanies";
import ManagePayments from "./pages/admin/ManagePayments";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/oauth2/callback" element={<OAuthCallback />} />
            </Route>

            <Route element={<ProtectedRoute role="STUDENT" />}>
              <Route element={<AppLayout role="STUDENT" />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/jobs" element={<JobList />} />
                <Route path="/student/applications" element={<MyApplications />} />
                <Route path="/student/works" element={<Works />} />
                <Route path="/student/payments" element={<StudentPayments />} />
                <Route path="/student/profile" element={<StudentProfile />} />
                <Route path="/student/chat" element={<Chat />} />
              </Route>
              <Route path="/student/interview/:interviewId" element={<Interview />} />
            </Route>

            <Route element={<ProtectedRoute role="COMPANY" />}>
              <Route element={<AppLayout role="COMPANY" />}>
                <Route path="/company/dashboard" element={<CompanyDashboard />} />
                <Route path="/company/applications" element={<Applications />} />
                <Route path="/company/applications/:applicationId" element={<ApplicationDetail />} />
                <Route path="/company/jobs/post" element={<PostJob />} />
                <Route path="/company/jobs" element={<MyJobs />} />
                <Route path="/company/jobs/:jobId/applicants" element={<JobApplicants />} />
                <Route path="/company/students" element={<StudentList />} />
                <Route path="/company/students/:userId" element={<StudentDetail />} />
                <Route path="/company/interviews" element={<InterviewResults />} />
                <Route path="/company/payments" element={<CompanyPayments />} />
                <Route path="/company/chat" element={<Chat />} />
                <Route path="/company/profile" element={<CompanyProfile />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute role="ADMIN" />}>
              <Route element={<AppLayout role="ADMIN" />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/students" element={<ManageStudents />} />
                <Route path="/admin/companies" element={<ManageCompanies />} />
                <Route path="/admin/jobs" element={<ManageJobs />} />
                <Route path="/admin/payments" element={<ManagePayments />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </Router>
  );
}
