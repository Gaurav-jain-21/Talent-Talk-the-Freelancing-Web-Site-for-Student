import { useState } from "react";
import Navbar from "../../components/Navbar";
import { postJob } from "../../api/jobApi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyId: user.userId,
    companyName: "",
    title: "",
    description: "",
    location: "",
    salary: "",
    skillsRequired: "",
    jobType: "Full Time",
    openings: 1,
    lastDateToApply: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await postJob(form);
      setMessage("Job posted successfully!");
      setTimeout(() => navigate("/company/jobs"), 2000);
    } catch (err) {
      setMessage(err.response?.data || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Post a Job</h1>

        {message && (
          <div
            className="bg-green-100 text-green-700 p-3
            rounded mb-4 text-sm"
          >
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Company Name", key: "companyName", type: "text" },
              { label: "Job Title", key: "title", type: "text" },
              { label: "Location", key: "location", type: "text" },
              { label: "Salary (eg: 3-5 LPA)", key: "salary", type: "text" },
              { label: "Skills Required", key: "skillsRequired", type: "text" },
              { label: "Number of Openings", key: "openings", type: "number" },
              {
                label: "Last Date to Apply",
                key: "lastDateToApply",
                type: "date",
              },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label
                  className="block text-sm font-medium
                  text-gray-700 mb-1"
                >
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [key]: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2
                    focus:outline-none focus:ring-2
                    focus:ring-blue-400"
                  required
                />
              </div>
            ))}

            <div>
              <label
                className="block text-sm font-medium
                text-gray-700 mb-1"
              >
                Job Type
              </label>
              <select
                value={form.jobType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    jobType: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-3 py-2
                  focus:outline-none focus:ring-2
                  focus:ring-blue-400"
              >
                <option>Full Time</option>
                <option>Part Time</option>
                <option>Internship</option>
                <option>Contract</option>
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-medium
                text-gray-700 mb-1"
              >
                Job Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                rows={4}
                className="w-full border rounded-lg px-3 py-2
                  focus:outline-none focus:ring-2
                  focus:ring-blue-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700
                text-white py-3 rounded-lg font-medium
                disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post Job"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
