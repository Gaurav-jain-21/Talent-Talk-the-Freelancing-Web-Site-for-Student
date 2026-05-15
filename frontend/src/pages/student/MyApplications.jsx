import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Inbox } from "lucide-react";
import { jobApi } from "../../api/services";
import { EmptyState, GhostButton, GlassCard, GradientButton, Modal, StatusBadge } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { useAuth } from "../../context/AuthContext";
import { asArray, errorMessage, formatDate, pick, progressForStatus, statusTone } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

const tabs = ["ALL", "PENDING", "SELECTED", "REJECTED", "WITHDRAWN"];

export default function MyApplications() {
  const { user } = useAuth();
  const [tab, setTab] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const query = useAsync(() => jobApi.studentApplications(user.userId), [user.userId]);
  const applications = asArray(query.data);
  const filtered = useMemo(() => applications.filter((item) => tab === "ALL" || String(item.status).toUpperCase() === tab), [applications, tab]);

  async function withdraw() {
    try {
      await jobApi.withdraw(pick(selected, ["id", "applicationId"]));
      toast.success("Application withdrawn");
      setSelected(null);
      query.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <Page className="space-y-6">
      <div>
        <h2 className="text-4xl font-black gradient-text">My Applications</h2>
        <p className="mt-2 text-slate-400">Your hiring pipeline with live status updates.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${tab === item ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-[0_0_25px_rgba(99,102,241,0.35)]" : "border border-white/10 bg-white/[0.04] text-slate-400"}`}>
            {item}
          </button>
        ))}
      </div>

      {filtered.length ? (
        <div className="grid gap-4">
          {filtered.map((application) => {
            const status = pick(application, ["status"], "PENDING");
            const progress = progressForStatus(status);
            return (
              <GlassCard key={pick(application, ["id", "applicationId"])} className={`p-5 glow-${statusTone(status)}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-white">{pick(application, ["jobTitle", "title"], "Application")}</h3>
                    <p className="mt-1 text-sm text-slate-400">{pick(application, ["companyName", "company"], "")} • {formatDate(pick(application, ["appliedDate", "createdAt"]))}</p>
                  </div>
                  <StatusBadge status={status} />
                </div>
                <div className="mt-5 h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" style={{ width: `${progress}%` }} />
                </div>
                {String(status).toUpperCase() === "PENDING" && (
                  <GhostButton className="mt-5 border-rose-400/25 text-rose-100" onClick={() => setSelected(application)}>
                    Withdraw
                  </GhostButton>
                )}
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Inbox} title="No applications in this view" message="Change the filter or apply to a new role." />
      )}

      <AnimatePresence>
        {selected && (
          <Modal title="Withdraw application?" onClose={() => setSelected(null)}>
            <p className="text-slate-400">This will move your application out of the active hiring pipeline.</p>
            <div className="mt-6 flex justify-end gap-3">
              <GhostButton onClick={() => setSelected(null)}>Cancel</GhostButton>
              <GradientButton onClick={withdraw}>Withdraw</GradientButton>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </Page>
  );
}

