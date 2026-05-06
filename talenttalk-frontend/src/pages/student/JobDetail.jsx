import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getJobById, applyToJob } from "../../api/jobApi";
import { useAuth } from "../../context/AuthContext";
import { getProfile } from "../../api/studentApi";
import { getErrorMessage } from "../../utils/errorMessage";

const JobDetail = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getJobById(jobId).then((res) => setJob(res.data));
  }, [jobId]);

  const handleApply = async () => {
    setLoading(true);
    try {
      const profileRes = await getProfile(user.userId);
      const profile = profileRes.data;
      await applyToJob({
        jobId: parseInt(jobId),
        studentId: parseInt(user.userId),
        studentName: profile.fullName,
        studentEmail: profile.email,
      });
      setApplied(true);
      setMessage("Applied successfully!");
    } catch (err) {
      setMessage(getErrorMessage(err, "Failed to apply"));
    } finally {
      setLoading(false);
    }
  };

  if (!job)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="text-center mt-10 text-gray-500">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow p-8">
          <h1 className="text-2xl font-bold text-gray-800">{job.title}</h1>
          <p className="text-blue-600 font-medium text-lg">{job.companyName}</p>

          <div className="flex gap-4 mt-3 text-gray-600">
            <span>📍 {job.location}</span>
            <span>💰 {job.salary}</span>
            <span>💼 {job.jobType}</span>
            <span>👥 {job.openings} openings</span>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-2">
              Job Description
            </h3>
            <p className="text-gray-600">{job.description}</p>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold text-gray-700 mb-2">
              Skills Required
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired?.split(",").map((skill, i) => (
                <span
                  key={i}
                  className="bg-blue-100 text-blue-700
                    px-3 py-1 rounded-full text-sm"
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Apply before: {new Date(job.lastDateToApply).toLocaleDateString()}
          </div>

          {message && (
            <div
              className={`mt-4 p-3 rounded ${
                applied
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <button
            onClick={handleApply}
            disabled={applied || loading}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700
              text-white py-3 rounded-lg font-medium
              disabled:opacity-50"
          >
            {applied ? "Applied!" : loading ? "Applying..." : "Apply Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
