import { useMemo, useState } from "react";
import { Award, ChevronDown, Search } from "lucide-react";
import { interviewApi } from "../../api/services";
import { Badge, EmptyState, GlassCard, ScoreRing } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { useAuth } from "../../context/AuthContext";
import { asArray, pick } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

export default function InterviewResults() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const listQuery = useAsync(() => interviewApi.company(user.userId), [user.userId]);
  const interviews = asArray(listQuery.data);
  const filtered = useMemo(() => interviews.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())), [interviews, query]);
  const activeId = selectedId || pick(filtered[0], ["id", "interviewId"], "");
  const resultQuery = useAsync(
    () => (activeId ? interviewApi.result(activeId) : Promise.resolve(null)),
    [activeId],
    { toast: false },
  );
  const result = resultQuery.data || filtered.find((item) => String(pick(item, ["id", "interviewId"])) === String(activeId)) || {};
  const interview = result.interview || result;
  const questions = asArray(pick(result, ["questions"], []));
  const recommendation = String(pick(interview, ["recommendation"], "")).toUpperCase();
  const recommended =
    (recommendation.includes("RECOMMENDED") && !recommendation.includes("NOT")) ||
    Number(pick(interview, ["score", "totalScore"], 0)) >= 70;

  return (
    <Page className="grid min-h-[calc(100vh-9rem)] gap-5 xl:grid-cols-[24rem_1fr]">
      <GlassCard hover={false} className="p-5">
        <h2 className="text-2xl font-black gradient-text">Interview Results</h2>
        <div className="relative mt-5">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search results" className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-white outline-none focus:border-cyan-300/40" />
        </div>
        <div className="mt-5 space-y-2">
          {filtered.map((interview) => {
            const id = pick(interview, ["id", "interviewId"]);
            return (
              <button key={id} onClick={() => setSelectedId(id)} className={`w-full rounded-2xl border p-4 text-left transition ${String(activeId) === String(id) ? "border-cyan-300/40 bg-cyan-400/10" : "border-white/10 bg-white/[0.03]"}`}>
                <p className="font-bold text-white">{pick(interview, ["studentName", "name"], "Student")}</p>
                <p className="text-sm text-slate-500">{pick(interview, ["jobTitle", "title"], "")}</p>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {activeId ? (
        <GlassCard hover={false} className="p-6">
          <div className={`mb-6 rounded-3xl border p-5 ${recommended ? "border-emerald-400/25 bg-emerald-400/10" : "border-rose-400/25 bg-rose-400/10"}`}>
            <Badge tone={recommended ? "green" : "red"}>{recommended ? "Recommended" : "Not Recommended"}</Badge>
            <h3 className="mt-3 text-3xl font-black text-white">{pick(interview, ["studentName", "name"], "Student")}</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            <ScoreRing score={pick(interview, ["score", "totalScore"], 0)} label="Total" />
            <div>
              <Badge tone="cyan">Grade {pick(interview, ["grade"], "Pending")}</Badge>
              <p className="mt-4 text-slate-400">{pick(interview, ["summary", "feedback"], "Detailed scoring will appear once the interview service returns a result.")}</p>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            {questions.map((item, index) => (
              <details key={pick(item, ["id"], index)} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <summary className="flex cursor-pointer items-center justify-between font-bold text-white">
                  Q{index + 1}. {pick(item, ["question"], "Question")}
                  <ChevronDown className="h-4 w-4" />
                </summary>
                <p className="mt-3 text-sm text-slate-400">{pick(item, ["answer", "response"], "")}</p>
              </details>
            ))}
          </div>
        </GlassCard>
      ) : (
        <EmptyState icon={Award} title="No interviews yet" message="Once students complete interviews, their results appear here." />
      )}
    </Page>
  );
}
