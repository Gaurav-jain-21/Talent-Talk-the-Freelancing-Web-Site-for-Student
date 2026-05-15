import { Link } from "react-router-dom";
import { BriefcaseBusiness, CalendarClock, ClipboardList, UserRound } from "lucide-react";
import {
  Badge,
  EmptyState,
  GlassCard,
  SkeletonGrid,
  StatusBadge,
} from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { useAuth } from "../../context/useAuth";
import { loadCompanyApplicationGroups, flattenCompanyApplications } from "../../utils/companyApplications";
import { formatDate, initials, pick } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

export default function Applications() {
  const { user } = useAuth();
  const query = useAsync(() => loadCompanyApplicationGroups(user.userId), [user.userId]);
  const groups = query.data || [];
  const applications = flattenCompanyApplications(groups);

  if (query.loading) {
    return (
      <Page className="space-y-6">
        <h2 className="text-4xl font-black gradient-text">Applications</h2>
        <SkeletonGrid cards={4} />
      </Page>
    );
  }

  return (
    <Page className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black gradient-text">Applications</h2>
          <p className="mt-2 text-slate-400">
            {applications.length} applications across {groups.length} posted jobs.
          </p>
        </div>
        <Badge tone="cyan">
          <ClipboardList className="h-3 w-3" /> Hiring pipeline
        </Badge>
      </div>

      {applications.length ? (
        <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {applications.map(({ application, job, jobId, applicationId }) => {
            const studentName = pick(application, ["studentName", "name"], "Student");
            const jobTitle = pick(job, ["title", "jobTitle", "name"], "Job post");
            const appliedAt = pick(application, ["appliedAt", "appliedDate", "createdAt"]);

            return (
              <Link
                key={`${jobId}-${applicationId}`}
                to={`/company/applications/${applicationId}`}
                className="block"
              >
                <GlassCard className="h-full p-5">
                  <div className="flex items-start gap-4">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 font-black text-white">
                      {initials(studentName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-xl font-black text-white">{studentName}</h3>
                          <p className="truncate text-sm text-slate-400">{pick(application, ["studentEmail", "email"], "")}</p>
                        </div>
                        <StatusBadge status={pick(application, ["status"], "PENDING")} />
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-slate-400">
                        <p className="flex items-center gap-2">
                          <BriefcaseBusiness className="h-4 w-4 text-cyan-200" /> {jobTitle}
                        </p>
                        <p className="flex items-center gap-2">
                          <CalendarClock className="h-4 w-4 text-purple-200" /> Applied {formatDate(appliedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={UserRound}
          title="No applications yet"
          message="When students apply to your jobs, their application cards will appear here."
        />
      )}
    </Page>
  );
}
