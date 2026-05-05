import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getApplicants, updateApplicationStatus } from "../../api/companyApi";
import { createInterview } from "../../api/interviewApi";
import { useAuth } from "../../context/AuthContext";

const JobApplicants = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    getApplicants(jobId).then((res) => setApplicants(res.data));
  }, []);

  const handleStatus = async (applicationId, status, studentId) => {
    try {
      await updateApplicationStatus(applicationId, status);
      setApplicants(
        applicants.map((a) => (a.id === applicationId ? { ...a, status } : a)),
      );
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleInterview = async (studentId) => {
    if (!deadline) {
      alert("Please set interview deadline first");
      return;
    }
    try {
      await createInterview({
        jobId: parseInt(jobId),
        studentId,
        companyId: parseInt(user.userId),
        deadline,
      });
      alert("Interview created! Student will be notified.");
    } catch (err) {
      alert(err.response?.data || "Failed to create interview");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Applicants for Job #{jobId}
        </h1>

        <div className="bg-white rounded-lg p-4 mb-4 flex gap-3">
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Interview Deadline
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="border rounded px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {applicants.length === 0 ? (
          <p className="text-center text-gray-500">No applicants yet</p>
        ) : (
          <div className="space-y-4">
            {applicants.map((app) => (
              <div key={app.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{app.studentName}</p>
                    <p className="text-sm text-gray-500">{app.studentEmail}</p>
                    <p className="text-sm text-gray-500">
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full
                    text-xs font-medium ${
                      app.status === "SELECTED"
                        ? "bg-green-100 text-green-700"
                        : app.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>

                <div className="flex gap-2 mt-4 flex-wrap">
                  <button
                    onClick={() =>
                      handleStatus(app.id, "SELECTED", app.studentId)
                    }
                    className="bg-green-500 hover:bg-green-600
                      text-white px-3 py-1 rounded text-sm"
                  >
                    Select
                  </button>
                  <button
                    onClick={() =>
                      handleStatus(app.id, "REJECTED", app.studentId)
                    }
                    className="bg-red-500 hover:bg-red-600
                      text-white px-3 py-1 rounded text-sm"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleInterview(app.studentId)}
                    className="bg-blue-500 hover:bg-blue-600
                      text-white px-3 py-1 rounded text-sm"
                  >
                    Schedule Interview
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

export default JobApplicants;
