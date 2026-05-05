
import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { getStudentApplications, withdrawApplication } from '../../api/jobApi'
import { useAuth } from '../../context/AuthContext'

const MyApplications = () => {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])

  useEffect(() => {
    getStudentApplications(user.userId)
      .then(res => setApplications(res.data))
  }, [])

  const handleWithdraw = async (applicationId) => {
    try {
      await withdrawApplication(applicationId)
      setApplications(applications.map(app =>
        app.id === applicationId
          ? { ...app, status: 'WITHDRAWN' }
          : app
      ))
    } catch (err) {
      alert(err.response?.data || 'Failed to withdraw')
    }
  }

  const statusColor = (status) => {
    switch (status) {
      case 'SELECTED': return 'bg-green-100 text-green-700'
      case 'REJECTED': return 'bg-red-100 text-red-700'
      case 'WITHDRAWN': return 'bg-gray-100 text-gray-700'
      default: return 'bg-yellow-100 text-yellow-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          My Applications
        </h1>

        {applications.length === 0 ? (
          <p className="text-center text-gray-500">
            No applications yet
          </p>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app.id}
                className="bg-white rounded-xl shadow p-6
                  flex justify-between items-center">
                <div>
                  <p className="font-semibold">Job ID: {app.jobId}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Applied: {new Date(app.appliedAt)
                      .toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full
                    text-sm font-medium ${statusColor(app.status)}`}>
                    {app.status}
                  </span>
                  {app.status === 'PENDING' && (
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      className="bg-red-500 hover:bg-red-600
                        text-white px-3 py-1 rounded text-sm">
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyApplications