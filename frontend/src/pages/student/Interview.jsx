import { useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Bot, CheckCircle2, Send, Sparkles } from "lucide-react";
import { interviewApi } from "../../api/services";
import { Badge, GhostButton, GlassCard, GradientButton, ScoreRing, TextArea } from "../../components/ui/Primitives";
import { MeshBackground } from "../../components/ui/Background";
import { Page } from "../../components/ui/Motion";
import { errorMessage, pick } from "../../utils/format";

export default function Interview() {
  const { interviewId } = useParams();
  const [state, setState] = useState("prestart");
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [lastScore, setLastScore] = useState(null);
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    try {
      const result = await interviewApi.start(interviewId);
      const firstQuestion = pick(asFirstQuestion(result), ["question"], "Your interview question is ready.");
      const firstQuestionNumber = pick(asFirstQuestion(result), ["questionNumber"], 1);
      setQuestionIndex(Number(firstQuestionNumber) || 1);
      setHistory([{ from: "ai", text: firstQuestion }]);
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
    try {
      const result = await interviewApi.answer({
        interviewId,
        answer,
        questionNumber: questionIndex,
      });
      setHistory((current) => [...current, { from: "student", text: answer }]);
      setLastScore(result);
      setAnswer("");
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
    try {
      const result = await interviewApi.nextQuestion(interviewId);
      const nextQuestion = pick(result, ["question"], "");
      const nextQuestionNumber = Number(pick(result, ["questionNumber"], questionIndex + 1));
      if (!nextQuestion || nextQuestionNumber > 7) {
        setState("complete");
        return;
      }
      setQuestionIndex(nextQuestionNumber);
      setHistory((current) => [...current, { from: "ai", text: nextQuestion }]);
      setLastScore(null);
      setState("active");
    } catch {
      setState("complete");
    }
  }

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
            <p className="mx-auto mt-4 max-w-xl text-slate-400">Answer seven questions clearly. You will receive score and feedback after each response.</p>
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
              <div className="h-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" style={{ width: `${(questionIndex / 7) * 100}%` }} />
            </div>
            <p className="font-bold text-slate-300">Question {questionIndex} of 7</p>
            <GlassCard hover={false} className="min-h-[28rem] p-5">
              <div className="space-y-4">
                {history.map((message, index) => (
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
                  <h3 className="text-2xl font-black text-white">Feedback</h3>
                  <p className="mt-2 text-slate-400">{pick(lastScore, ["feedback", "comment"], "Your answer was recorded.")}</p>
                </div>
                <GradientButton onClick={next}>Next</GradientButton>
              </GlassCard>
            )}
          </div>
        )}

        {state === "complete" && (
          <GlassCard hover={false} className="mx-auto max-w-2xl p-8 text-center">
            <CheckCircle2 className="mx-auto h-20 w-20 text-emerald-300 drop-shadow-[0_0_24px_rgba(16,185,129,0.6)]" />
            <h1 className="mt-5 text-5xl font-black gradient-text">Interview complete</h1>
            <p className="mt-3 text-slate-400">Your responses have been submitted for company review.</p>
            <GhostButton className="mt-8" onClick={() => history.back()}>Back to dashboard</GhostButton>
          </GlassCard>
        )}
      </Page>
    </MeshBackground>
  );
}

function asFirstQuestion(result) {
  if (Array.isArray(result?.questions) && result.questions.length) return result.questions[0];
  if (Array.isArray(result?.data?.questions) && result.data.questions.length) return result.data.questions[0];
  return result;
}
