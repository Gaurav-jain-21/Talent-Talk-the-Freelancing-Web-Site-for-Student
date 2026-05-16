import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CalendarClock, ExternalLink, Eye, FileText } from "lucide-react";
import { companyApi, interviewApi, studentApi } from "../../api/services";
import ResumePreviewModal from "../../components/ResumePreviewModal";
import {
  Badge,
  EmptyState,
  Field,
  GhostButton,
  GlassCard,
  GradientButton,
  Skeleton,
  StatusBadge,
} from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { useAuth } from "../../context/useAuth";
import { loadCompanyApplicationGroups, flattenCompanyApplications } from "../../utils/companyApplications";
import { asArray, errorMessage, formatDate, initials, pick } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

export default function ApplicationDetail() {
  const { user } = useAuth();
  const { applicationId } = useParams();
  const [deadline, setDeadline] = useState("");
  const [showResumeModal, setShowResumeModal] = useState(false);
  const applicationsQuery = useAsync(() => loadCompanyApplicationGroups(user.userId), [user.userId]);
  const match = flattenCompanyApplications(applicationsQuery.data || []).find(
    (item) => String(item.applicationId) === String(applicationId),
  );
  const application = match?.application || {};
  const studentId = pick(application, ["studentId", "userId"]);
  const studentQuery = useAsync(
    () => (studentId ? companyApi.student(studentId) : Promise.resolve(null)),
    [studentId],
    { toast: false },
  );
  const projectsQuery = useAsync(
    () => (studentId ? studentApi.projects(studentId) : Promise.resolve([])),
    [studentId],
    { toast: false },
  );
  const student = studentQuery.data || {};
  const job = match?.job || {};
  const resumeUrl = pick(student, ["resumeUrl", "resume", "resumeLink"], "");

  async function setStatus(status) {
    try {
      await companyApi.updateApplicationStatus(applicationId, { status });
      toast.success(`Application marked ${status.toLowerCase()}`);
      applicationsQuery.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  async function createInterview() {
    if (!deadline) {
      toast.error("Please choose an interview deadline first.");
      return;
    }
    if (!studentId || !match?.jobId || !user.userId) {
      toast.error("Application details are still loading. Please try again.");
      return;
    }
    try {
      await interviewApi.create({
        applicationId,
        studentId,
        jobId: match?.jobId,
        companyId: user.userId,
        deadline,
      });
      toast.success("Interview created");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  if (applicationsQuery.loading || studentQuery.loading) {
    return <Page><Skeleton className="h-96 rounded-[2rem]" /></Page>;
  }

  if (!match) {
    return (
      <Page className="space-y-6">
        <Link to="/company/applications">
          <GhostButton><ArrowLeft className="h-4 w-4" /> Applications</GhostButton>
        </Link>
        <EmptyState
          icon={FileText}
          title="Application not found"
          message="This application may no longer exist or belongs to another company job."
        />
      </Page>
    );
  }

  return (
    <Page className="space-y-6">
      <Link to="/company/applications">
        <GhostButton><ArrowLeft className="h-4 w-4" /> Applications</GhostButton>
      </Link>

      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-cyan-500/10 p-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="grid h-24 w-24 place-items-center rounded-[2rem] bg-slate-950/50 text-3xl font-black text-white">
              {initials(pick(student, ["fullName", "name"], pick(application, ["studentName"], "Student")))}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-4xl font-black text-white">
                  {pick(student, ["fullName", "name"], pick(application, ["studentName"], "Student"))}
                </h2>
                <StatusBadge status={pick(application, ["status"], "PENDING")} />
              </div>
              <p className="mt-1 text-slate-300">
                Applied for {pick(job, ["title", "jobTitle", "name"], "Job post")} on{" "}
                {formatDate(pick(application, ["appliedAt", "appliedDate", "createdAt"]))}
              </p>
              <p className="mt-1 text-sm text-slate-400">{pick(student, ["email"], pick(application, ["studentEmail"], ""))}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {resumeUrl ? (
              <GhostButton onClick={() => setShowResumeModal(true)}>
                <Eye className="h-4 w-4" /> View Resume
              </GhostButton>
            ) : (
              <GhostButton disabled><FileText className="h-4 w-4" /> No Resume</GhostButton>
            )}
            {pick(student, ["githubUrl", "github"], "") && (
              <a href={pick(student, ["githubUrl", "github"], "")} target="_blank" rel="noreferrer">
                <GhostButton><ExternalLink className="h-4 w-4" /> GitHub</GhostButton>
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
        <div className="space-y-5">
          <GlassCard className="p-6">
            <h3 className="mb-4 text-xl font-black text-white">Student Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="College" value={pick(student, ["college"], "Not added")} />
              <Info label="Degree" value={pick(student, ["degree"], "Not added")} />
              <Info label="Phone" value={pick(student, ["phone"], "Not added")} />
              <Info label="Work Status" value={pick(student, ["workStatus"], "Open to work")} />
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-400">
              {pick(student, ["bio", "about"], "No bio added yet.")}
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="mb-4 text-xl font-black text-white">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {asArray(pick(student, ["skills"], [])).length ? (
                asArray(pick(student, ["skills"], [])).map((skill) => <Badge key={skill} tone="cyan">{skill}</Badge>)
              ) : (
                <p className="text-sm text-slate-500">No skills added yet.</p>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="mb-4 text-xl font-black text-white">Projects</h3>
            {asArray(projectsQuery.data).length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {asArray(projectsQuery.data).map((project) => (
                  <div key={pick(project, ["id", "title"])} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="font-black text-white">{pick(project, ["title", "name"], "Project")}</p>
                    <p className="mt-1 text-sm text-slate-400">{pick(project, ["description"], "")}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No projects added yet.</p>
            )}
          </GlassCard>
        </div>

        <GlassCard className="h-fit p-6">
          <h3 className="text-xl font-black text-white">Decision</h3>
          <p className="mt-2 text-sm text-slate-400">
            Review the profile and resume, then move this application forward.
          </p>
          <div className="mt-6 space-y-3">
            <Field
              label="Interview deadline"
              type="datetime-local"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
            />
            <GradientButton className="w-full" onClick={() => setStatus("SELECTED")}>
              Accept
            </GradientButton>
            <GhostButton className="w-full border-rose-400/25 text-rose-100" onClick={() => setStatus("REJECTED")}>
              Reject
            </GhostButton>
            <GhostButton className="w-full" onClick={createInterview}>
              <CalendarClock className="h-4 w-4" /> Schedule Interview
            </GhostButton>
          </div>
        </GlassCard>
      </div>

      {showResumeModal && resumeUrl && studentId && (
        <ResumePreviewModal userId={studentId} onClose={() => setShowResumeModal(false)} />
      )}
    </Page>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}
