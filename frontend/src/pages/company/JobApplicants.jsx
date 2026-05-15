import { useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { UserRound } from "lucide-react";
import { companyApi, interviewApi } from "../../api/services";
import {
  EmptyState,
  Field,
} from "../../components/ui/Primitives";
import ApplicantCard from "../../components/ApplicantCard";
import { Page } from "../../components/ui/Motion";
import { useAuth } from "../../context/useAuth";
import {
  asArray,
  errorMessage,
  pick,
} from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

export default function JobApplicants() {
  const { user } = useAuth();
  const { jobId } = useParams();
  const [deadline, setDeadline] = useState("");
  const query = useAsync(() => companyApi.applicants(jobId), [jobId]);
  const applicants = asArray(query.data);

  async function setStatus(applicant, status) {
    try {
      await companyApi.updateApplicationStatus(
        pick(applicant, ["applicationId", "id"]),
        { status },
      );
      toast.success(`Marked ${status.toLowerCase()}`);
      query.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  async function createInterview(applicant) {
    if (!deadline) {
      toast.error("Please choose an interview deadline first.");
      return;
    }
    if (!pick(applicant, ["studentId", "userId"]) || !jobId || !user.userId) {
      toast.error("Applicant details are still loading. Please try again.");
      return;
    }
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
          <p className="mt-2 text-slate-400">
            Select, reject, or schedule AI interviews.
          </p>
        </div>
        <div className="w-full max-w-sm">
          <Field
            label="Interview deadline"
            type="datetime-local"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
          />
        </div>
      </div>

      {applicants.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {applicants.map((applicant) => (
            <ApplicantCard
              key={pick(applicant, ["applicationId", "id", "studentId"])}
              applicant={applicant}
              onSelect={(item) => setStatus(item, "SELECTED")}
              onReject={(item) => setStatus(item, "REJECTED")}
              onInterview={createInterview}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={UserRound}
          title="No applicants yet"
          message="Applicants will appear here as students apply."
        />
      )}
    </Page>
  );
}
