import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getStudentApplications } from '../../api/jobApi'
import { getPendingInterviews } from '../../api/interviewApi'
import { Link } from 'react-router-dom'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [interviews, setInterviews] = useState([])

  useEffect(() => {
    getStudentApplications(user.userId)
      .then(res => setApplications(res.data))
      .catch(console.error)

    getPendingInterviews(user.userId)
      .then(res => setInterviews(res.data))
      .catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Welcome back, {user?.name}!
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-3xl font-bold text-blue-600">
              {applications.length}
            </p>
            <p className="text-gray-600 mt-1">Applications</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-3xl font-bold text-green-600">
              {applications.filter(a =>
                a.status === 'SELECTED').length}
            </p>
            <p className="text-gray-600 mt-1">Selected</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-3xl font-bold text-orange-600">
              {interviews.length}
            </p>
            <p className="text-gray-600 mt-1">Pending Interviews</p>
          </div>
        </div>

        {/* Pending Interviews */}
        {interviews.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200
            rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-4">
              Pending Interviews
            </h2>
            {interviews.map(interview => (
              <div key={interview.id}
                className="flex justify-between items-center
                  bg-white p-4 rounded-lg mb-2 shadow-sm">
                <div>
                  <p className="font-medium">{interview.jobTitle}</p>
                  <p className="text-sm text-gray-500">
                    Deadline: {new Date(interview.deadline)
                      .toLocaleDateString()}
                  </p>
                </div>
                <Link
                  to={`/student/interview/${interview.id}`}
                  className="bg-yellow-500 hover:bg-yellow-600
                    text-white px-4 py-2 rounded-lg text-sm">
                  Start Interview
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Recent Applications */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Recent Applications
          </h2>
          {applications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No applications yet.</p>
              <Link to="/student/jobs"
                className="text-blue-600 hover:underline mt-2 block">
                Browse Jobs
              </Link>
            </div>
          ) : (
            applications.slice(0, 5).map(app => (
              <div key={app.id}
                className="flex justify-between items-center
                  border-b py-3 last:border-0">
                <div>
                  <p className="font-medium">{app.studentName}</p>
                  <p className="text-sm text-gray-500">
                    Job ID: {app.jobId}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs
                  font-medium ${
                  app.status === 'SELECTED'
                    ? 'bg-green-100 text-green-700'
                    : app.status === 'REJECTED'
                    ? 'bg-red-100 text-red-700'
                    : app.status === 'WITHDRAWN'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {app.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard