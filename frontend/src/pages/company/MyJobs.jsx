import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { BriefcaseBusiness, CalendarClock, Edit3, PauseCircle, Trash2, Users } from "lucide-react";
import { jobApi } from "../../api/services";
import {
  Badge,
  EmptyState,
  Field,
  GhostButton,
  GlassCard,
  GradientButton,
  Modal,
  SkeletonGrid,
  TextArea,
} from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { useAuth } from "../../context/AuthContext";
import { loadCompanyApplicationGroups } from "../../utils/companyApplications";
import { asArray, errorMessage, formatDate, pick } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

export default function MyJobs() {
  const { user } = useAuth();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const query = useAsync(() => loadCompanyApplicationGroups(user.userId), [user.userId]);
  const groups = query.data || [];
  const totalApplications = groups.reduce((sum, group) => sum + group.applicants.length, 0);

  async function closeJob(job) {
    try {
      await jobApi.close(pick(job, ["id", "jobId"]));
      toast.success("Job stopped");
      query.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  async function removeJob() {
    try {
      await jobApi.delete(pick(deleteTarget, ["id", "jobId"]));
      toast.success("Job deleted");
      setDeleteTarget(null);
      query.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  async function saveJob(payload) {
    try {
      await jobApi.update(pick(editTarget, ["id", "jobId"]), payload);
      toast.success("Job updated");
      setEditTarget(null);
      query.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  if (query.loading) {
    return (
      <Page className="space-y-6">
        <h2 className="text-4xl font-black gradient-text">My Jobs</h2>
        <SkeletonGrid cards={4} />
      </Page>
    );
  }

  return (
    <Page className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black gradient-text">My Jobs</h2>
          <p className="mt-2 text-slate-400">
            {groups.length} jobs posted, {totalApplications} total applications.
          </p>
        </div>
        <Badge tone="cyan">
          <BriefcaseBusiness className="h-3 w-3" /> Job management
        </Badge>
      </div>

      {groups.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {groups.map(({ job, jobId, applicants }) => {
            const isActive = pick(job, ["isActive"], true) !== false && String(pick(job, ["status"], "ACTIVE")).toUpperCase() !== "CLOSED";
            return (
              <GlassCard key={jobId} className="flex h-full flex-col p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-2xl font-black text-white">{pick(job, ["title", "jobTitle", "name"], "Untitled role")}</h3>
                    <p className="mt-1 text-sm text-slate-400">{pick(job, ["location"], "Remote")}</p>
                  </div>
                  <Badge tone={isActive ? "green" : "slate"}>{isActive ? "Active" : "Stopped"}</Badge>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">
                  {pick(job, ["description"], "No description added.")}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Metric icon={Users} label="Applications" value={applicants.length} />
                  <Metric icon={CalendarClock} label="Last Date" value={formatDate(pick(job, ["lastDateToApply", "lastDate", "deadline"]))} />
                  <Metric icon={BriefcaseBusiness} label="Openings" value={pick(job, ["openings"], 0)} />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {asArray(pick(job, ["skillsRequired", "skills"], [])).slice(0, 6).map((skill) => (
                    <Badge key={skill} tone="indigo">{skill}</Badge>
                  ))}
                </div>

                <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-3">
                  <GhostButton onClick={() => setEditTarget(job)}>
                    <Edit3 className="h-4 w-4" /> Edit
                  </GhostButton>
                  <GhostButton onClick={() => closeJob(job)} disabled={!isActive}>
                    <PauseCircle className="h-4 w-4" /> Stop
                  </GhostButton>
                  <GhostButton className="border-rose-400/25 text-rose-100" onClick={() => setDeleteTarget(job)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </GhostButton>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={BriefcaseBusiness} title="No jobs yet" message="Post a job and it will appear here with application counts and controls." />
      )}

      <AnimatePresence>
        {deleteTarget && (
          <Modal title="Delete job?" onClose={() => setDeleteTarget(null)}>
            <p className="text-slate-400">This removes the job from your company list.</p>
            <div className="mt-6 flex justify-end gap-3">
              <GhostButton onClick={() => setDeleteTarget(null)}>Cancel</GhostButton>
              <GradientButton onClick={removeJob}>Delete</GradientButton>
            </div>
          </Modal>
        )}
        {editTarget && (
          <EditJobModal
            job={editTarget}
            onClose={() => setEditTarget(null)}
            onSave={saveJob}
          />
        )}
      </AnimatePresence>
    </Page>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <Icon className="mb-3 h-5 w-5 text-cyan-100" />
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}

function EditJobModal({ job, onClose, onSave }) {
  const initial = useMemo(() => ({
    title: pick(job, ["title", "jobTitle"], ""),
    company: pick(job, ["companyName", "company"], ""),
    type: pick(job, ["jobType", "type"], "Internship"),
    description: pick(job, ["description"], ""),
    location: pick(job, ["location"], ""),
    salary: pick(job, ["salary"], ""),
    openings: pick(job, ["openings"], 1),
    lastDate: pick(job, ["lastDateToApply", "lastDate"], ""),
    skills: asArray(pick(job, ["skillsRequired", "skills"], [])),
    companyId: pick(job, ["companyId"], ""),
  }), [job]);
  const [form, setForm] = useState(initial);
  const [skill, setSkill] = useState("");

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function addSkill() {
    if (!skill.trim()) return;
    update("skills", [...form.skills, skill.trim()]);
    setSkill("");
  }

  function removeSkill(target) {
    update("skills", form.skills.filter((item) => item !== target));
  }

  return (
    <Modal title="Edit job" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Job title" value={form.title} onChange={(event) => update("title", event.target.value)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Location" value={form.location} onChange={(event) => update("location", event.target.value)} />
          <Field label="Salary" value={form.salary} onChange={(event) => update("salary", event.target.value)} />
          <Field label="Openings" type="number" min="1" max="100" value={form.openings} onChange={(event) => update("openings", event.target.value)} />
          <Field label="Last date" type="date" value={String(form.lastDate).slice(0, 10)} onChange={(event) => update("lastDate", event.target.value)} />
        </div>
        <TextArea label="Description" value={form.description} onChange={(event) => update("description", event.target.value)} />
        <div className="flex gap-2">
          <Field label="Skill" value={skill} onChange={(event) => setSkill(event.target.value)} />
          <GhostButton onClick={addSkill}>Add</GhostButton>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.skills.map((item) => (
            <button key={item} onClick={() => removeSkill(item)}>
              <Badge tone="cyan">{item}</Badge>
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <GradientButton onClick={() => onSave(form)}>Save changes</GradientButton>
        </div>
      </div>
    </Modal>
  );
}
