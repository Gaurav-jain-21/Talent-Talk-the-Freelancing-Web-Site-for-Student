import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { BriefcaseBusiness, Trash2 } from "lucide-react";
import { adminApi } from "../../api/services";
import { EmptyState, GhostButton, GlassCard, GradientButton, Modal, SearchBox, StatusBadge } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { asArray, errorMessage, formatDate, pick } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

export default function ManageJobs() {
  const [queryText, setQueryText] = useState("");
  const [target, setTarget] = useState(null);
  const query = useAsync(() => adminApi.jobs(), []);
  const jobs = asArray(query.data);
  const filtered = useMemo(() => jobs.filter((job) => JSON.stringify(job).toLowerCase().includes(queryText.toLowerCase())), [jobs, queryText]);

  async function closeJob(job) {
    try {
      await adminApi.closeJob(pick(job, ["id", "jobId"]));
      toast.success("Job closed");
      query.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  async function removeJob() {
    try {
      await adminApi.deleteJob(pick(target, ["id", "jobId"]));
      toast.success("Job deleted");
      setTarget(null);
      query.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <Page className="space-y-6">
      <h2 className="text-4xl font-black gradient-text">Manage Jobs</h2>
      <SearchBox value={queryText} onChange={setQueryText} placeholder="Search jobs" />
      {filtered.length ? (
        <GlassCard hover={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-5 py-4">Job</th><th className="px-5 py-4">Company</th><th className="px-5 py-4">Location</th><th className="px-5 py-4">Salary</th><th className="px-5 py-4">Deadline</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((job) => {
                  const active = pick(job, ["isActive"], true);
                  return (
                    <tr key={pick(job, ["id", "jobId"])} className="hover:bg-cyan-400/5">
                      <td className="px-5 py-4"><p className="font-bold text-white">{pick(job, ["title", "jobTitle"], "Job")}</p><p className="line-clamp-1 max-w-sm text-sm text-slate-500">{pick(job, ["description"], "")}</p></td>
                      <td className="px-5 py-4 text-slate-300">{pick(job, ["companyName", "company"], "Company")}</td>
                      <td className="px-5 py-4 text-slate-400">{pick(job, ["location"], "Remote")}</td>
                      <td className="px-5 py-4 text-slate-400">{pick(job, ["salary"], "Not added")}</td>
                      <td className="px-5 py-4 text-sm text-slate-400">{formatDate(pick(job, ["lastDateToApply", "lastDate"]))}</td>
                      <td className="px-5 py-4"><StatusBadge status={active ? "ACTIVE" : "CLOSED"} /></td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-2"><GhostButton onClick={() => closeJob(job)}>Close</GhostButton><GhostButton className="border-rose-400/25 text-rose-100" onClick={() => setTarget(job)}><Trash2 className="h-4 w-4" /> Delete</GhostButton></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      ) : (
        <EmptyState icon={BriefcaseBusiness} title="No jobs found" message="Jobs from the database appear here." />
      )}
      <AnimatePresence>
        {target && (
          <Modal title="Delete job?" onClose={() => setTarget(null)}>
            <p className="text-slate-400">This deletes the job completely from the job database.</p>
            <div className="mt-6 flex justify-end gap-3"><GhostButton onClick={() => setTarget(null)}>Cancel</GhostButton><GradientButton onClick={removeJob}>Delete</GradientButton></div>
          </Modal>
        )}
      </AnimatePresence>
    </Page>
  );
}
