import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getStudentProfile } from "../../api/companyApi";
import { getProjects } from "../../api/studentApi";

const StudentDetail = () => {
  const { userId } = useParams();
  const [student, setStudent] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getStudentProfile(userId).then((res) => setStudent(res.data));
    getProjects(userId).then((res) => setProjects(res.data));
  }, []);

  if (!student)
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
        <div className="bg-white rounded-xl shadow p-8 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {student.fullName}
          </h1>
          <p className="text-gray-600">{student.email}</p>
          <p className="text-gray-600">{student.phone}</p>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-500">College</p>
              <p className="font-medium">{student.college}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Degree</p>
              <p className="font-medium">{student.degree}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Graduation Year</p>
              <p className="font-medium">{student.graduationYear}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Work Status</p>
              <p className="font-medium">{student.workStatus}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-1">Bio</p>
            <p className="text-gray-700">{student.bio}</p>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {student.skills?.split(",").map((s, i) => (
                <span
                  key={i}
                  className="bg-blue-100 text-blue-700
                    px-3 py-1 rounded-full text-sm"
                >
                  {s.trim()}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            {student.githubUrl && (
              <a
                href={student.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                GitHub
              </a>
            )}
            {student.linkedinUrl && (
              <a
                href={student.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                LinkedIn
              </a>
            )}
            {student.resumeUrl && (
              <a
                href={student.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-1
                  rounded text-sm hover:bg-blue-700"
              >
                View Resume
              </a>
            )}
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Projects</h2>
          {projects.length === 0 ? (
            <p className="text-gray-500 text-sm">No projects added</p>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 mb-3">
                <h3 className="font-medium">{project.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {project.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Tech: {project.techStack}
                </p>
                {project.projectUrl && (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-xs hover:underline"
                  >
                    View Project
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
