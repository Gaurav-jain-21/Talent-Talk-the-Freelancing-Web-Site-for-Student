import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const getLinks = () => {
    if (user?.role === "STUDENT") {
      return (
        <>
          <Link to="/student/dashboard" className="hover:text-blue-400">
            Dashboard
          </Link>
          <Link to="/student/jobs" className="hover:text-blue-400">
            Jobs
          </Link>
          <Link to="/student/applications" className="hover:text-blue-400">
            Applications
          </Link>
          <Link to="/student/chat" className="hover:text-blue-400">
            Messages
          </Link>
          <Link to="/student/profile" className="hover:text-blue-400">
            Profile
          </Link>
        </>
      );
    }
    if (user?.role === "COMPANY") {
      return (
        <>
          <Link to="/company/dashboard" className="hover:text-blue-400">
            Dashboard
          </Link>
          <Link to="/company/jobs" className="hover:text-blue-400">
            My Jobs
          </Link>
          <Link to="/company/students" className="hover:text-blue-400">
            Students
          </Link>
          <Link to="/company/chat" className="hover:text-blue-400">
            Messages
          </Link>
          <Link to="/company/profile" className="hover:text-blue-400">
            Profile
          </Link>
        </>
      );
    }
    if (user?.role === "ADMIN") {
      return (
        <>
          <Link to="/admin/dashboard" className="hover:text-blue-400">
            Dashboard
          </Link>
          <Link to="/admin/students" className="hover:text-blue-400">
            Students
          </Link>
          <Link to="/admin/companies" className="hover:text-blue-400">
            Companies
          </Link>
          <Link to="/admin/jobs" className="hover:text-blue-400">
            Jobs
          </Link>
        </>
      );
    }
  };

  return (
    <nav
      className="bg-gray-900 text-white px-6 py-4
      flex justify-between items-center shadow-lg"
    >
      <div className="text-xl font-bold text-blue-400">Talent Talk</div>
      <div className="flex gap-6 items-center text-sm">
        {getLinks()}
        <span className="text-gray-400">Hi, {user?.name}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600
            px-3 py-1 rounded text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
