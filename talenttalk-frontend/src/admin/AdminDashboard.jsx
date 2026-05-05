import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getDashboard } from "../../api/adminApi";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getDashboard().then((res) => setStats(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Students",
              value: stats?.totalStudents,
              color: "blue",
              link: "/admin/students",
            },
            {
              label: "Companies",
              value: stats?.totalCompanies,
              color: "green",
              link: "/admin/companies",
            },
            {
              label: "Jobs",
              value: stats?.totalJobs,
              color: "purple",
              link: "/admin/jobs",
            },
            { label: "Status", value: "✅", color: "orange", link: "#" },
          ].map(({ label, value, color, link }) => (
            <Link to={link} key={label}>
              <div
                className="bg-white p-6 rounded-xl shadow
                text-center hover:shadow-md transition"
              >
                <p className={`text-3xl font-bold text-${color}-600`}>
                  {value ?? "..."}
                </p>
                <p className="text-gray-600 mt-1">{label}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-2">System Status</h2>
          <p className="text-green-600">
            {stats?.serviceStatus || "Loading..."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
