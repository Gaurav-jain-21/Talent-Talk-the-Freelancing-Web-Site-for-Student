import { Link } from "react-router-dom";
import { BriefcaseBusiness, CircleCheckBig, PlusCircle, Users, Video } from "lucide-react";
import { companyApi, interviewApi } from "../../api/services";
import JobCard from "../../components/JobCard";
import { EmptyState, GlassCard, GradientButton, ScoreRing, SkeletonGrid, StatCard } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { useAuth } from "../../context/useAuth";
import { asArray, pick } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

export default function CompanyDashboard() {
  const { user } = useAuth();
  const jobsQuery = useAsync(() => companyApi.jobs(user.userId), [user.userId]);
  const interviewsQuery = useAsync(() => interviewApi.company(user.userId), [user.userId], { toast: false });
  const jobs = asArray(jobsQuery.data);
  const interviews = asArray(interviewsQuery.data);
  const applicantCount = jobs.reduce((sum, job) => sum + (Number(pick(job, ["applicantCount", "applications"], 0)) || 0), 0);
  const recommended = interviews.filter((item) => Boolean(pick(item, ["recommended"], false))).length;

  return (
    <Page className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-600/25 via-purple-600/15 to-cyan-500/10 p-8">
        <h2 className="text-5xl font-black gradient-text">Company command center</h2>
        <p className="mt-3 max-w-2xl text-slate-400">Publish jobs, evaluate students, and move interviews through the hiring loop.</p>
      </section>

      {jobsQuery.loading ? (
        <SkeletonGrid cards={4} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Active Jobs" value={jobs.filter((job) => String(pick(job, ["status"], "ACTIVE")).toUpperCase() !== "CLOSED").length} icon={BriefcaseBusiness} />
          <StatCard label="Total Applicants" value={applicantCount} icon={Users} tone="cyan" />
          <StatCard label="Interviews Done" value={interviews.length} icon={Video} tone="green" />
          <StatCard label="Recommended" value={recommended} icon={CircleCheckBig} tone="yellow" />
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Link to="/company/jobs/post">
          <GlassCard className="h-full p-7">
            <PlusCircle className="mb-8 h-10 w-10 text-cyan-200" />
            <h3 className="text-3xl font-black text-white">Post New Job</h3>
            <p className="mt-2 text-slate-400">Launch a polished opening and begin receiving applicants.</p>
          </GlassCard>
        </Link>
        <Link to="/company/students">
          <GlassCard className="h-full p-7">
            <Users className="mb-8 h-10 w-10 text-purple-200" />
            <h3 className="text-3xl font-black text-white">Browse Students</h3>
            <p className="mt-2 text-slate-400">Search profiles, skills, resumes, and project portfolios.</p>
          </GlassCard>
        </Link>
      </div>

      <section className="space-y-4">
        <h3 className="text-2xl font-black text-white">Recent Jobs</h3>
        {jobs.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {jobs.slice(0, 4).map((job) => <JobCard key={pick(job, ["id", "jobId"])} job={job} />)}
          </div>
        ) : (
          <EmptyState icon={BriefcaseBusiness} title="No jobs posted" message="Create your first opening to start receiving applicants." />
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-white">Interview Results</h3>
          <Link to="/company/interviews"><GradientButton>Open results</GradientButton></Link>
        </div>
        {interviews.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {interviews.slice(0, 3).map((interview) => (
              <GlassCard key={pick(interview, ["id", "interviewId"])} className="flex items-center gap-4 p-5">
                <ScoreRing score={pick(interview, ["score", "totalScore"], 0)} />
                <div>
                  <p className="font-black text-white">{pick(interview, ["studentName", "name"], "Student")}</p>
                  <p className="text-sm text-slate-500">{pick(interview, ["jobTitle", "title"], "")}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <EmptyState icon={Video} title="No interview results" message="Completed AI interviews will be summarized here." />
        )}
      </section>
    </Page>
  );
}
