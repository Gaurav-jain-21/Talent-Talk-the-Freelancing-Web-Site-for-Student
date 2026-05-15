import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Bot, CheckCircle2, Send, Sparkles } from "lucide-react";
import { interviewApi } from "../../api/services";
import { Badge, GhostButton, GlassCard, GradientButton, ScoreRing, TextArea } from "../../components/ui/Primitives";
import { MeshBackground } from "../../components/ui/Background";
import { Page } from "../../components/ui/Motion";
import { errorMessage, pick } from "../../utils/format";

const DEFAULT_TOTAL_QUESTIONS = 10;

export default function Interview() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState("prestart");
  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(DEFAULT_TOTAL_QUESTIONS);
  const [lastScore, setLastScore] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    try {
      const result = await interviewApi.start(interviewId);
      const firstQuestionItem = asFirstQuestion(result);
      if (!firstQuestionItem) {
        setFinalResult(result);
        setState("complete");
        return;
      }
      const firstQuestion = pick(firstQuestionItem, ["question"], "Your interview question is ready.");
      const firstQuestionNumber = pick(firstQuestionItem, ["questionNumber"], 1);
      const generatedQuestions = Array.isArray(result?.questions) ? result.questions.length : 0;
      setTotalQuestions(generatedQuestions || DEFAULT_TOTAL_QUESTIONS);
      setQuestionIndex(Number(firstQuestionNumber) || 1);
      setMessages([{ from: "ai", text: firstQuestion }]);
      setState("active");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!answer.trim()) return;
    setLoading(true);
    const submittedAnswer = answer;
    try {
      const result = await interviewApi.answer({
        interviewId,
        answer: submittedAnswer,
        questionNumber: questionIndex,
      });
      setMessages((current) => [...current, { from: "student", text: submittedAnswer }]);
      setLastScore(result);
      setAnswer("");
      if (questionIndex >= totalQuestions) {
        await loadFinalResult();
        return;
      }
      setState("feedback");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function next() {
    loadNextQuestion();
  }

  async function loadNextQuestion() {
    setLoading(true);
    try {
      const result = await interviewApi.nextQuestion(interviewId);
      const nextQuestion = pick(result, ["question"], "");
      const nextQuestionNumber = Number(pick(result, ["questionNumber"], questionIndex + 1));
      if (!nextQuestion || nextQuestionNumber > totalQuestions) {
        await loadFinalResult();
        return;
      }
      setQuestionIndex(nextQuestionNumber);
      setMessages((current) => [...current, { from: "ai", text: nextQuestion }]);
      setLastScore(null);
      setState("active");
    } catch {
      await loadFinalResult();
    } finally {
      setLoading(false);
    }
  }

  async function loadFinalResult() {
    try {
      const result = await interviewApi.result(interviewId);
      setFinalResult(result);
    } catch {
      setFinalResult(null);
    }
    setState("complete");
  }

  const finalInterview = finalResult?.interview || finalResult || {};
  const finalQuestions = Array.isArray(finalResult?.questions) ? finalResult.questions : [];

  return (
    <MeshBackground>
      <Page className="mx-auto max-w-5xl px-4 py-8">
        {state === "prestart" && (
          <GlassCard hover={false} className="mx-auto max-w-3xl p-8 text-center">
            <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br from-indigo-500/30 to-cyan-400/20 text-cyan-100 shadow-[0_0_60px_rgba(6,182,212,0.24)]">
              <Bot className="h-12 w-12" />
            </div>
            <Badge tone="cyan">AI Interview</Badge>
            <h1 className="mt-5 text-5xl font-black gradient-text">Ready when you are</h1>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">Answer each question clearly. Your final score and feedback are generated after the last response.</p>
            <GlassCard hover={false} className="mt-8 p-5 text-left">
              <p className="font-bold text-white">Rules</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>Keep answers specific and tied to your experience.</li>
                <li>Do not refresh once the interview starts.</li>
                <li>Submit before the deadline configured by the company.</li>
              </ul>
            </GlassCard>
            <GradientButton loading={loading} onClick={start} className="mt-8 px-8 py-4 text-base">
              Begin Interview <Sparkles className="h-5 w-5" />
            </GradientButton>
          </GlassCard>
        )}

        {(state === "active" || state === "feedback") && (
          <div className="space-y-6">
            <div className="rounded-full bg-white/10 p-1">
              <div className="h-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" style={{ width: `${(questionIndex / totalQuestions) * 100}%` }} />
            </div>
            <p className="font-bold text-slate-300">Question {questionIndex} of {totalQuestions}</p>
            <GlassCard hover={false} className="min-h-[28rem] p-5">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={`${message.from}-${index}`} className={`flex ${message.from === "student" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] rounded-3xl px-5 py-4 ${message.from === "student" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white" : "border border-purple-400/20 bg-white/[0.04] text-slate-100 shadow-[0_0_28px_rgba(139,92,246,0.12)]"}`}>
                      {message.from === "ai" && <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-purple-200"><Bot className="h-4 w-4" /> AI</p>}
                      <p>{message.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {state === "active" && (
              <GlassCard hover={false} className="p-4">
                <TextArea label="Your answer" value={answer} maxLength={2000} onChange={(event) => setAnswer(event.target.value)} />
                <div className="mt-3 flex items-center justify-between gap-4">
                  <p className="text-xs text-slate-500">{answer.length}/2000</p>
                  <GradientButton loading={loading} onClick={submit}><Send className="h-4 w-4" /> Submit</GradientButton>
                </div>
              </GlassCard>
            )}

            {state === "feedback" && (
              <GlassCard hover={false} className="grid gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:items-center">
                <ScoreRing score={pick(lastScore, ["score", "marks"], 0)} />
                <div>
                  <h3 className="text-2xl font-black text-white">Answer saved</h3>
                  <p className="mt-2 text-slate-400">{pick(lastScore, ["feedback", "comment"], "Your response was recorded. Continue to the next question when ready.")}</p>
                </div>
                <GradientButton loading={loading} onClick={next}>Next</GradientButton>
              </GlassCard>
            )}
          </div>
        )}

        {state === "complete" && (
          <GlassCard hover={false} className="mx-auto max-w-2xl p-8 text-center">
            <CheckCircle2 className="mx-auto h-20 w-20 text-emerald-300 drop-shadow-[0_0_24px_rgba(16,185,129,0.6)]" />
            <h1 className="mt-5 text-5xl font-black gradient-text">Interview complete</h1>
            <p className="mt-3 text-slate-400">Your responses have been submitted for company review.</p>
            {finalResult && (
              <div className="mt-8 grid gap-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-left md:grid-cols-[auto_1fr]">
                <ScoreRing score={pick(finalInterview, ["totalScore", "score"], 0)} label="Total" />
                <div>
                  <Badge tone="cyan">Grade {pick(finalInterview, ["grade"], "Pending")}</Badge>
                  <p className="mt-3 text-sm text-slate-400">{pick(finalInterview, ["summary"], "Your final review is being prepared.")}</p>
                  <p className="mt-3 text-xs text-slate-500">{finalQuestions.length} answers submitted</p>
                </div>
              </div>
            )}
            <GhostButton className="mt-8" onClick={() => navigate("/student/dashboard")}>Back to dashboard</GhostButton>
          </GlassCard>
        )}
      </Page>
    </MeshBackground>
  );
}

function asFirstQuestion(result) {
  if (Array.isArray(result?.questions) && result.questions.length) {
    return result.questions.find((item) => !pick(item, ["studentAnswer"], "")) || null;
  }
  if (Array.isArray(result?.data?.questions) && result.data.questions.length) {
    return result.data.questions.find((item) => !pick(item, ["studentAnswer"], "")) || null;
  }
  return result;
}
