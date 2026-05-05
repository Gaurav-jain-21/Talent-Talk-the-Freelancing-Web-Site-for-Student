import { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { startInterview, submitAnswer } from "../../api/interviewApi";

const Interview = () => {
  const { interviewId } = useParams();
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [interview, setInterview] = useState(null);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await startInterview(interviewId);
      setInterview(res.data.interview);
      setQuestions(res.data.questions);
      setStarted(true);
    } catch (err) {
      alert(err.response?.data || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const res = await submitAnswer({
        interviewId: parseInt(interviewId),
        questionNumber: currentQ + 1,
        answer,
      });
      setFeedback({
        score: res.data.score,
        feedback: res.data.feedback,
      });
    } catch (err) {
      alert(err.response?.data || "Failed to submit answer");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      setCompleted(true);
    } else {
      setCurrentQ(currentQ + 1);
      setAnswer("");
      setFeedback(null);
    }
  };

  if (completed)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto p-6 text-center">
          <div className="bg-white rounded-xl shadow p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Interview Completed!
            </h2>
            <p className="text-gray-600">
              Your answers have been evaluated. The company will review your
              results shortly.
            </p>
          </div>
        </div>
      </div>
    );

  if (!started)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-5xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              AI Interview
            </h2>
            <p className="text-gray-600 mb-6">
              You will be asked 7 questions based on the job requirements and
              your profile. Answer each question honestly and thoroughly.
            </p>
            <ul
              className="text-left text-sm text-gray-600
            mb-6 space-y-2"
            >
              <li>✅ 7 personalized questions</li>
              <li>✅ Each answer is evaluated by AI</li>
              <li>✅ Score out of 100</li>
              <li>✅ Results visible to company</li>
            </ul>
            <button
              onClick={handleStart}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white
              px-8 py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? "Preparing questions..." : "Start Interview"}
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        {/* Progress */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500">
            Question {currentQ + 1} of {questions.length}
          </span>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`w-8 h-2 rounded-full ${
                  i < currentQ
                    ? "bg-green-500"
                    : i === currentQ
                      ? "bg-blue-500"
                      : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-600 font-medium mb-1">
              🤖 AI Interviewer
            </p>
            <p className="text-gray-800 font-medium">
              {questions[currentQ]?.question}
            </p>
          </div>

          {!feedback && (
            <>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={5}
                className="w-full border rounded-lg px-4 py-3
                  focus:outline-none focus:ring-2
                  focus:ring-blue-400 resize-none"
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={loading || !answer.trim()}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700
                  text-white py-2 rounded-lg font-medium
                  disabled:opacity-50"
              >
                {loading ? "Evaluating..." : "Submit Answer"}
              </button>
            </>
          )}
          {feedback && (
            <div className="mt-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-500 mb-1">Your answer:</p>
                <p className="text-gray-700">{answer}</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-green-700">AI Feedback</p>
                  <span
                    className="bg-green-600 text-white
                    px-3 py-1 rounded-full text-sm font-bold"
                  >
                    {feedback.score}/10
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{feedback.feedback}</p>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-green-600 hover:bg-green-700
                  text-white py-2 rounded-lg font-medium"
              >
                {currentQ + 1 >= questions.length
                  ? "Finish Interview"
                  : "Next Question →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interview;
