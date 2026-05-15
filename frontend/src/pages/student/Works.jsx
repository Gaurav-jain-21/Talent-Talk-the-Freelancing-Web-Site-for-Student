import { useMemo } from "react";
import toast from "react-hot-toast";
import { BriefcaseBusiness } from "lucide-react";
import { jobApi, paymentApi, studentApi } from "../../api/services";
import {
  Badge,
  EmptyState,
  GlassCard,
  SkeletonGrid,
  StatusBadge,
} from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { useAuth } from "../../context/useAuth";
import { asArray, errorMessage, formatDate, pick } from "../../utils/format";
import { remainingForApplication } from "../../utils/paymentSummary";
import { useAsync } from "../../utils/useAsync";

async function loadWorks(studentId) {
  const applications = asArray(await jobApi.studentApplications(studentId)).filter(
    (application) => String(pick(application, ["status"], "")).toUpperCase() === "SELECTED",
  );

  return Promise.all(
    applications.map(async (application) => {
      const jobId = pick(application, ["jobId"]);
      try {
        const job = jobId ? await jobApi.byId(jobId) : null;
        return { application, job, jobId };
      } catch {
        return { application, job: null, jobId };
      }
    }),
  );
}

function workTone(status) {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "COMPLETED") return "green";
  if (normalized === "IN_PROGRESS") return "yellow";
  return "slate";
}

function workLabel(status) {
  return String(status || "IN_PROGRESS").replaceAll("_", " ");
}

export default function Works() {
  const { user } = useAuth();
  const query = useAsync(() => loadWorks(user.userId), [user.userId]);
  const paymentsQuery = useAsync(() => paymentApi.student(user.userId), [user.userId], { toast: false });
  const works = useMemo(
    () =>
      (query.data || []).filter(({ application, job }) =>
        remainingForApplication(paymentsQuery.data || [], pick(application, ["id", "applicationId"]), job) > 0,
      ),
    [paymentsQuery.data, query.data],
  );
  const completed = useMemo(
    () =>
      works.filter(
        ({ application }) =>
          String(pick(application, ["workStatus"], "")).toUpperCase() === "COMPLETED",
      ).length,
    [works],
  );

  async function updateWork(application, workStatus) {
    const applicationId = pick(application, ["id", "applicationId"]);
    const currentStatus = pick(application, ["workStatus"], "IN_PROGRESS");
    if (String(currentStatus).toUpperCase() === String(workStatus).toUpperCase()) return;

    try {
      await jobApi.updateWorkStatus(applicationId, workStatus);
      toast.success(`Work marked ${workLabel(workStatus).toLowerCase()}`);
      query.refresh();
    } catch (error) {
      try {
        await studentApi.updateApplicationWorkStatus(applicationId, workStatus);
        toast.success(`Work marked ${workLabel(workStatus).toLowerCase()}`);
        query.refresh();
      } catch {
        toast.error(`${errorMessage(error)}. Status was not saved.`);
      }
    }
  }

  if (query.loading) {
    return (
      <Page className="space-y-6">
        <h2 className="text-4xl font-black gradient-text">Works</h2>
        <SkeletonGrid cards={4} />
      </Page>
    );
  }

  return (
    <Page className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black gradient-text">Works</h2>
            <p className="mt-2 text-slate-400">
              {works.length} selected works, {completed} completed.
            </p>
          </div>
          <Badge tone="cyan">
            <BriefcaseBusiness className="h-3 w-3" /> Selected by companies
          </Badge>
        </div>
      </section>

      {works.length ? (
        <GlassCard hover={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Work / Project</th>
                  <th className="px-5 py-4">Company</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Selected On</th>
                  <th className="px-5 py-4">Application</th>
                  <th className="px-5 py-4">Work Status</th>
                  <th className="px-5 py-4">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {works.map(({ application, job, jobId }) => {
                  const workStatus = pick(application, ["workStatus"], "IN_PROGRESS");
                  const applicationId = pick(application, ["id", "applicationId"]);
                  return (
                    <tr key={applicationId || jobId} className="transition hover:bg-white/[0.03]">
                      <td className="px-5 py-4">
                        <p className="font-black text-white">
                          {pick(
                            application,
                            ["projectTitle"],
                            pick(job, ["title", "jobTitle"], "Selected work"),
                          )}
                        </p>
                        <p className="mt-1 line-clamp-2 max-w-md text-sm text-slate-500">
                          {pick(job, ["description"], "Company selected you for this work.")}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-300">
                        {pick(job, ["companyName", "company"], "Company")}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-400">
                        {pick(job, ["location"], "Remote")}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-400">
                        {formatDate(pick(application, ["updatedAt", "appliedAt", "createdAt"]))}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={pick(application, ["status"], "SELECTED")} />
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={workTone(workStatus)}>{workLabel(workStatus)}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={workStatus || "IN_PROGRESS"}
                          onChange={(event) => updateWork(application, event.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-cyan-300/50"
                        >
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      ) : (
        <EmptyState
          icon={BriefcaseBusiness}
          title="No selected works yet"
          message="When a company accepts your application, the assigned work will appear here."
        />
      )}
    </Page>
  );
}
