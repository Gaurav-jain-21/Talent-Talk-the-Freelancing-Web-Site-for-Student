import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getAllJobs } from "../../api/jobApi";
import { useNavigate } from "react-router-dom";

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAllJobs()
      .then((res) => setJobs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(
    (job) =>
      job.title?.toLowerCase().includes(search.toLowerCase()) ||
      job.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      job.location?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Browse Jobs</h1>

        <input
          type="text"
          placeholder="Search by title, company, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-6
            focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {loading ? (
          <p className="text-center text-gray-500">Loading jobs...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500">No jobs found</p>
        ) : (
          <div className="grid gap-4">
            {filtered.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow p-6
                  hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/student/jobs/${job.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2
                      className="text-lg font-semibold
                      text-gray-800"
                    >
                      {job.title}
                    </h2>
                    <p className="text-blue-600 font-medium">
                      {job.companyName}
                    </p>
                    <div
                      className="flex gap-3 mt-2 text-sm
                      text-gray-500"
                    >
                      <span>📍 {job.location}</span>
                      <span>💰 {job.salary}</span>
                      <span>💼 {job.jobType}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Skills: {job.skillsRequired}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className="bg-blue-100 text-blue-700
                      px-3 py-1 rounded-full text-xs"
                    >
                      {job.openings} openings
                    </span>
                    <p className="text-xs text-gray-400 mt-2">
                      Apply by:{" "}
                      {new Date(job.lastDateToApply).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList;
