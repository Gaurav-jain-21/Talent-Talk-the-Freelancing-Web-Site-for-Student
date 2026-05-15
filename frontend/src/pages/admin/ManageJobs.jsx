import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { BriefcaseBusiness, Trash2 } from "lucide-react";
import { adminApi } from "../../api/services";
import JobCard from "../../components/JobCard";
import { EmptyState, GhostButton, GradientButton, Modal } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { asArray, errorMessage, pick } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

export default function ManageJobs() {
  const [target, setTarget] = useState(null);
  const query = useAsync(() => adminApi.jobs(), []);
  const jobs = asArray(query.data);

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
      {jobs.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {jobs.map((job) => (
            <JobCard
              key={pick(job, ["id", "jobId"])}
              job={job}
              actions={(
                <div className="flex w-full gap-3">
                  <GhostButton className="flex-1" onClick={() => closeJob(job)}>Close</GhostButton>
                  <GhostButton className="border-rose-400/25 text-rose-100" onClick={() => setTarget(job)}><Trash2 className="h-4 w-4" /> Delete</GhostButton>
                </div>
              )}
            />
          ))}
        </div>
      ) : (
        <EmptyState icon={BriefcaseBusiness} title="No jobs found" message="Jobs published through the platform appear here." />
      )}
      <AnimatePresence>
        {target && (
          <Modal title="Delete job?" onClose={() => setTarget(null)}>
            <p className="text-slate-400">This administrative action deletes the job.</p>
            <div className="mt-6 flex justify-end gap-3">
              <GhostButton onClick={() => setTarget(null)}>Cancel</GhostButton>
              <GradientButton onClick={removeJob}>Delete</GradientButton>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </Page>
  );
}

