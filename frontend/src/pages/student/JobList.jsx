import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { BriefcaseBusiness } from "lucide-react";
import { jobApi, studentApi } from "../../api/services";
import JobCard from "../../components/JobCard";
import { EmptyState, SearchBox, SkeletonGrid } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { useAuth } from "../../context/useAuth";
import { asArray, errorMessage, pick } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

export default function JobList() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState(new Set());
  const jobsQuery = useAsync(() => jobApi.all(), []);
  const profileQuery = useAsync(() => studentApi.profile(user.userId), [user.userId], { toast: false });
  const jobs = asArray(jobsQuery.data);
  const profile = profileQuery.data || {};

  const filtered = useMemo(() => {
    const term = query.toLowerCase();
    return jobs.filter((job) => JSON.stringify(job).toLowerCase().includes(term));
  }, [jobs, query]);

  async function apply(job) {
    const jobId = pick(job, ["id", "jobId"]);
    const studentName = user.name || pick(profile, ["fullName", "name"], "");
    const studentEmail = user.email || pick(profile, ["email"], "");
    if (!studentName || !studentEmail) {
      toast.error("Complete your student profile email before applying.");
      return;
    }
    try {
      await jobApi.apply({ jobId, studentId: user.userId, studentName, studentEmail });
      setApplied((current) => new Set(current).add(String(jobId)));
      toast.success("Application submitted");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <Page className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
        <h2 className="text-4xl font-black gradient-text">Find your next role</h2>
        <p className="mt-2 text-slate-400">Search live openings from companies connected to Talent Talk.</p>
        <div className="mt-6">
          <SearchBox value={query} onChange={setQuery} placeholder="Search by title, company, skill, location" />
        </div>
      </section>

      {jobsQuery.loading ? (
        <SkeletonGrid cards={6} />
      ) : filtered.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {filtered.map((job) => {
            const id = String(pick(job, ["id", "jobId"]));
            return <JobCard key={id} job={job} onApply={apply} applied={applied.has(id) || Boolean(job.applied)} />;
          })}
        </div>
      ) : (
        <EmptyState icon={BriefcaseBusiness} title="No jobs found" message="Adjust your search or check back after companies publish new openings." />
      )}
    </Page>
  );
}
