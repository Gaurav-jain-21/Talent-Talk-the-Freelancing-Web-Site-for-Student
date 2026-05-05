import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getMyJobs } from "../../api/companyApi";
import { closeJob, deleteJob } from "../../api/jobApi";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const MyJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    getMyJobs(user.userId).then((res) => setJobs(res.data));
  }, []);

  const handleClose = async (jobId) => {
    try {
      await closeJob(jobId);
      setJobs(
        jobs.map((j) => (j.id === jobId ? { ...j, isActive: false } : j)),
      );
    } catch (err) {
      alert("Failed to close job");
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await deleteJob(jobId);
      setJobs(jobs.filter((j) => j.id !== jobId));
    } catch (err) {
      alert("Failed to delete job");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Jobs</h1>
          <Link
            to="/company/jobs/post"
            className="bg-blue-600 hover:bg-blue-700
              text-white px-4 py-2 rounded-lg text-sm"
          >
            + Post New Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <p className="text-center text-gray-500">No jobs posted yet</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-gray-800">{job.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {job.location} • {job.jobType} • {job.salary}
                    </p>
                    <p className="text-sm text-gray-500">
                      Openings: {job.openings}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      job.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {job.isActive ? "Active" : "Closed"}
                  </span>
                </div>

                <div className="flex gap-3 mt-4">
                  <Link
                    to={`/company/jobs/${job.id}/applicants`}
                    className="bg-blue-100 text-blue-700
                      px-3 py-1 rounded text-sm hover:bg-blue-200"
                  >
                    View Applicants
                  </Link>
                  {job.isActive && (
                    <button
                      onClick={() => handleClose(job.id)}
                      className="bg-yellow-100 text-yellow-700
                        px-3 py-1 rounded text-sm
                        hover:bg-yellow-200"
                    >
                      Close Job
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="bg-red-100 text-red-700
                      px-3 py-1 rounded text-sm
                      hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
