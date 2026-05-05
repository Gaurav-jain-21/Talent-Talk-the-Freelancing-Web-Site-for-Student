import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { getMyJobs } from "../../api/companyApi";
import { getCompanyInterviews } from "../../api/interviewApi";
import { Link } from "react-router-dom";

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    getMyJobs(user.userId)
      .then((res) => setJobs(res.data))
      .catch(console.error);

    getCompanyInterviews(user.userId)
      .then((res) => setInterviews(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Company Dashboard
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-3xl font-bold text-blue-600">{jobs.length}</p>
            <p className="text-gray-600 mt-1">Active Jobs</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-3xl font-bold text-green-600">
              {interviews.filter((i) => i.status === "COMPLETED").length}
            </p>
            <p className="text-gray-600 mt-1">Interviews Done</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-3xl font-bold text-purple-600">
              {
                interviews.filter((i) => i.recommendation === "RECOMMENDED")
                  .length
              }
            </p>
            <p className="text-gray-600 mt-1">Recommended</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link
            to="/company/jobs/post"
            className="bg-blue-600 hover:bg-blue-700 text-white
              p-6 rounded-xl text-center font-medium"
          >
            + Post New Job
          </Link>
          <Link
            to="/company/students"
            className="bg-green-600 hover:bg-green-700 text-white
              p-6 rounded-xl text-center font-medium"
          >
            Browse Students
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">My Jobs</h2>
            <Link
              to="/company/jobs"
              className="text-blue-600 text-sm hover:underline"
            >
              View all
            </Link>
          </div>
          {jobs.slice(0, 5).map((job) => (
            <div
              key={job.id}
              className="flex justify-between items-center
                border-b py-3 last:border-0"
            >
              <div>
                <p className="font-medium">{job.title}</p>
                <p className="text-sm text-gray-500">
                  {job.location} • {job.jobType}
                </p>
              </div>
              <Link
                to={`/company/jobs/${job.id}/applicants`}
                className="text-blue-600 text-sm hover:underline"
              >
                View Applicants
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
