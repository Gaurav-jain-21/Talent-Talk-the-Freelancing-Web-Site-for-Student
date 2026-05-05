import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { getCompanyInterviews } from '../../api/interviewApi'
import { getResult } from '../../api/interviewApi'
import { useAuth } from '../../context/AuthContext'

const InterviewResults = () => {
  const { user } = useAuth()
  const [interviews, setInterviews] = useState([])
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    getCompanyInterviews(user.userId)
      .then(res => setInterviews(res.data))
  }, [])

  const viewResult = async (interviewId) => {
    const res = await getResult(interviewId)
    setResult(res.data)
    setSelected(interviewId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Interview Results
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Interview List */}
          <div className="space-y-3">
            {interviews.map(interview => (
              <div key={interview.id}
                className={`bg-white rounded-xl shadow p-4
                  cursor-pointer hover:shadow-md transition ${
                  selected === interview.id
                    ? 'border-2 border-blue-500' : ''
                }`}
                onClick={() => viewResult(interview.id)}>
                <p className="font-medium">{interview.studentName}</p>
                <p className="text-sm text-gray-500">
                  {interview.jobTitle}
                </p>
                <div className="flex justify-between mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    interview.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-700'
                      : interview.status === 'EXPIRED'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {interview.status}
                  </span>
                  {interview.totalScore && (
                    <span className="font-bold text-blue-600">
                      {interview.totalScore}/100
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Result Detail */}
          {result && (
            <div className="bg-white rounded-xl shadow p-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600">
                  {result.interview.totalScore}/100
                </div>
                <div className="text-2xl font-bold text-gray-700">
                  Grade: {result.interview.grade}
                </div>
                <span className={`mt-2 inline-block px-4 py-1
                  rounded-full text-sm font-medium ${
                  result.interview.recommendation === 'RECOMMENDED'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {result.interview.recommendation}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4">
                {result.interview.summary}
              </p>

              <h3 className="font-semibold mb-3">Q&A Review</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {result.questions.map(q => (
                  <div key={q.id}
                    className="border rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700">
                      Q{q.questionNumber}: {q.question}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      A: {q.studentAnswer}
                    </p>
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        {q.feedback}
                      </p>
                      <span className="text-xs font-bold
                        text-blue-600">
                        {q.score}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InterviewResults