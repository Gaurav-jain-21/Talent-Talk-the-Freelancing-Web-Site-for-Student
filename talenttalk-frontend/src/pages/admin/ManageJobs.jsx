import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getAllJobs, deleteJob, closeJob } from "../../api/adminApi";

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    getAllJobs().then((res) => setJobs(res.data));
  }, []);

  const handleDelete = async (jobId) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await deleteJob(jobId);
      setJobs(jobs.filter((j) => j.id !== jobId));
    } catch {
      alert("Failed to delete");
    }
  };

  const handleClose = async (jobId) => {
    try {
      await closeJob(jobId);
      setJobs(
        jobs.map((j) => (j.id === jobId ? { ...j, isActive: false } : j)),
      );
    } catch {
      alert("Failed to close");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Manage Jobs ({jobs.length})
        </h1>
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl shadow p-4
                flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{job.title}</p>
                <p className="text-sm text-gray-500">
                  {job.companyName} • {job.location}
                </p>
              </div>
              <div className="flex gap-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    job.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {job.isActive ? "Active" : "Closed"}
                </span>
                {job.isActive && (
                  <button
                    onClick={() => handleClose(job.id)}
                    className="bg-yellow-100 text-yellow-700
                      px-2 py-1 rounded text-xs hover:bg-yellow-200"
                  >
                    Close
                  </button>
                )}
                <button
                  onClick={() => handleDelete(job.id)}
                  className="bg-red-100 text-red-700
                    px-2 py-1 rounded text-xs hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageJobs;
