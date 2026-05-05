import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getAllStudents } from "../../api/studentApi";
import { useNavigate } from "react-router-dom";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getAllStudents().then((res) => setStudents(res.data));
  }, []);

  const filtered = students.filter(
    (s) =>
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.skills?.toLowerCase().includes(search.toLowerCase()) ||
      s.college?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Browse Students
        </h1>

        <input
          type="text"
          placeholder="Search by name, skills, college..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-6
            focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div className="grid gap-4">
          {filtered.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-xl shadow p-6
                hover:shadow-md transition cursor-pointer"
              onClick={() => navigate(`/company/students/${student.userId}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-gray-800">
                    {student.fullName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {student.college} • {student.degree}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{student.bio}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {student.skills?.split(",").map((s, i) => (
                      <span
                        key={i}
                        className="bg-blue-100 text-blue-700
                          px-2 py-0.5 rounded text-xs"
                      >
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    student.workStatus === "AVAILABLE"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {student.workStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentList;
