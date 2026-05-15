import { CalendarClock, CircleCheckBig, CircleX, ClipboardList, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import { jobApi, interviewApi } from "../../api/services";
import { Badge, EmptyState, GlassCard, GhostButton, SkeletonGrid, StatCard, StatusBadge } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { useAuth } from "../../context/useAuth";
import { asArray, formatDate, pick } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

export default function StudentDashboard() {
  const { user } = useAuth();
  const apps = useAsync(() => jobApi.studentApplications(user.userId), [user.userId]);
  const interviews = useAsync(() => interviewApi.pendingForStudent(user.userId), [user.userId]);
  const applications = asArray(apps.data);
  const pendingInterviews = asArray(interviews.data);
  const selected = applications.filter((item) => String(item.status).toUpperCase() === "SELECTED").length;
  const rejected = applications.filter((item) => String(item.status).toUpperCase() === "REJECTED").length;

  return (
    <Page className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-600/20 via-purple-600/15 to-cyan-500/10 p-8 shadow-[0_0_90px_rgba(99,102,241,0.18)]">
        <Badge tone="cyan">Student cockpit</Badge>
        <h2 className="mt-5 text-4xl font-black text-white sm:text-6xl">Welcome back, <span className="gradient-text">{user.name}</span></h2>
        <p className="mt-4 max-w-2xl text-slate-400">Track applications, interviews, and hiring momentum from one polished workspace.</p>
      </section>

      {apps.loading || interviews.loading ? (
        <SkeletonGrid cards={4} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Applications" value={applications.length} icon={ClipboardList} tone="indigo" />
          <StatCard label="Selected" value={selected} icon={CircleCheckBig} tone="green" />
          <StatCard label="Pending Interviews" value={pendingInterviews.length} icon={CalendarClock} tone="yellow" />
          <StatCard label="Rejected" value={rejected} icon={CircleX} tone="red" />
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-2xl font-black text-white">Pending Interviews</h3>
          <Link to="/student/jobs"><GhostButton>Browse jobs</GhostButton></Link>
        </div>
        {pendingInterviews.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingInterviews.map((interview) => (
              <GlassCard key={pick(interview, ["id", "interviewId"])} className="p-5">
                <Badge tone="yellow">Deadline {formatDate(pick(interview, ["deadline", "endTime"]))}</Badge>
                <h4 className="mt-4 text-xl font-black text-white">{pick(interview, ["jobTitle", "title"], "Interview")}</h4>
                <p className="mt-1 text-sm text-slate-400">{pick(interview, ["companyName", "company"], "")}</p>
                <Link to={`/student/interview/${pick(interview, ["id", "interviewId"])}`}>
                  <GhostButton className="mt-5 w-full">Start Interview</GhostButton>
                </Link>
              </GlassCard>
            ))}
          </div>
        ) : (
          <EmptyState icon={CalendarClock} title="No pending interviews" message="When a company schedules an AI interview, it will appear here immediately." />
        )}
      </section>

      <section className="space-y-4">
        <h3 className="text-2xl font-black text-white">Recent Applications</h3>
        {applications.length ? (
          <div className="overflow-hidden rounded-3xl border border-white/10">
            {applications.slice(0, 6).map((application) => (
              <div key={pick(application, ["id", "applicationId"])} className="grid gap-3 border-b border-white/10 bg-white/[0.03] p-4 transition hover:bg-cyan-400/5 md:grid-cols-[1fr_auto_auto]">
                <div>
                  <p className="font-bold text-white">{pick(application, ["jobTitle", "title"], "Application")}</p>
                  <p className="text-sm text-slate-500">{pick(application, ["companyName", "company"], "")}</p>
                </div>
                <StatusBadge status={pick(application, ["status"], "PENDING")} />
                <p className="text-sm text-slate-500">{formatDate(pick(application, ["appliedDate", "createdAt"]))}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Inbox} title="No applications yet" message="Apply to jobs and your pipeline will build itself here." />
        )}
      </section>
    </Page>
  );
}
