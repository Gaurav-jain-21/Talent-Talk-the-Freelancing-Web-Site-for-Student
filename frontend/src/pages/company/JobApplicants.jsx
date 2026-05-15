import { useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { CalendarClock, UserRound } from "lucide-react";
import { companyApi, interviewApi } from "../../api/services";
import { Badge, EmptyState, Field, GhostButton, GlassCard, GradientButton, StatusBadge } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { useAuth } from "../../context/AuthContext";
import { asArray, errorMessage, formatDate, initials, pick } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

export default function JobApplicants() {
  const { user } = useAuth();
  const { jobId } = useParams();
  const [deadline, setDeadline] = useState("");
  const query = useAsync(() => companyApi.applicants(jobId), [jobId]);
  const applicants = asArray(query.data);

  async function setStatus(applicant, status) {
    try {
      await companyApi.updateApplicationStatus(pick(applicant, ["applicationId", "id"]), { status });
      toast.success(`Marked ${status.toLowerCase()}`);
      query.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  async function createInterview(applicant) {
    try {
      await interviewApi.create({
        applicationId: pick(applicant, ["applicationId", "id"]),
        studentId: pick(applicant, ["studentId", "userId"]),
        jobId,
        companyId: user.userId,
        deadline,
      });
      toast.success("Interview created");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <Page className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black gradient-text">Applicants</h2>
          <p className="mt-2 text-slate-400">Select, reject, or schedule AI interviews.</p>
        </div>
        <div className="w-full max-w-sm">
          <Field label="Interview deadline" type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
        </div>
      </div>

      {applicants.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {applicants.map((applicant) => (
            <GlassCard key={pick(applicant, ["applicationId", "id", "studentId"])} className="p-5">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 font-black">{initials(pick(applicant, ["name", "studentName"]))}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-black text-white">{pick(applicant, ["name", "studentName"], "Student")}</p>
                  <p className="truncate text-sm text-slate-400">{pick(applicant, ["email", "studentEmail"], "")}</p>
                  <p className="mt-1 text-xs text-slate-500">Applied {formatDate(pick(applicant, ["appliedDate", "appliedAt", "createdAt"]))}</p>
                </div>
                <StatusBadge status={pick(applicant, ["status"], "PENDING")} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge tone="cyan"><UserRound className="h-3 w-3" /> {pick(applicant, ["degree", "college"], "Profile")}</Badge>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <GhostButton className="border-emerald-400/25 text-emerald-100" onClick={() => setStatus(applicant, "SELECTED")}>Select</GhostButton>
                <GhostButton className="border-rose-400/25 text-rose-100" onClick={() => setStatus(applicant, "REJECTED")}>Reject</GhostButton>
                <GradientButton onClick={() => createInterview(applicant)}><CalendarClock className="h-4 w-4" /> Interview</GradientButton>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <EmptyState icon={UserRound} title="No applicants yet" message="Applicants will appear here as students apply." />
      )}
    </Page>
  );
}
