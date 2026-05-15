import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import OAuthCallback from "./pages/auth/OAuthCallback";
import StudentDashboard from "./pages/student/StudentDashboard";
import JobList from "./pages/student/JobList";
import StudentProfile from "./pages/student/StudentProfile";
import MyApplications from "./pages/student/MyApplications";
import Interview from "./pages/student/Interview";
import Chat from "./pages/Chat";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import PostJob from "./pages/company/PostJob";
import MyJobs from "./pages/company/MyJobs";
import JobApplicants from "./pages/company/JobApplicants";
import StudentList from "./pages/company/StudentList";
import StudentDetail from "./pages/company/StudentDetail";
import InterviewResults from "./pages/company/InterviewResults";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageJobs from "./pages/admin/ManageJobs";

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
              <Route path="/oauth2/callback" element={<OAuthCallback />} />
            </Route>

            <Route element={<ProtectedRoute role="STUDENT" />}>
              <Route element={<AppLayout role="STUDENT" />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/jobs" element={<JobList />} />
                <Route path="/student/applications" element={<MyApplications />} />
                <Route path="/student/profile" element={<StudentProfile />} />
                <Route path="/student/chat" element={<Chat />} />
              </Route>
              <Route path="/student/interview/:interviewId" element={<Interview />} />
            </Route>

            <Route element={<ProtectedRoute role="COMPANY" />}>
              <Route element={<AppLayout role="COMPANY" />}>
                <Route path="/company/dashboard" element={<CompanyDashboard />} />
                <Route path="/company/jobs/post" element={<PostJob />} />
                <Route path="/company/jobs" element={<MyJobs />} />
                <Route path="/company/jobs/:jobId/applicants" element={<JobApplicants />} />
                <Route path="/company/students" element={<StudentList />} />
                <Route path="/company/students/:userId" element={<StudentDetail />} />
                <Route path="/company/interviews" element={<InterviewResults />} />
                <Route path="/company/chat" element={<Chat />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute role="ADMIN" />}>
              <Route element={<AppLayout role="ADMIN" />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/students" element={<ManageStudents />} />
                <Route path="/admin/jobs" element={<ManageJobs />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </Router>
  );
}

