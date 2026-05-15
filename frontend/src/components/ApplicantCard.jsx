import { Link } from "react-router-dom";
import { CalendarClock, Eye, UserRound } from "lucide-react";
import {
  Badge,
  GhostButton,
  GlassCard,
  GradientButton,
  StatusBadge,
} from "./ui/Primitives";
import { formatDate, initials, pick } from "../utils/format";

export default function ApplicantCard({
  applicant,
  onSelect,
  onReject,
  onInterview,
  compact = false,
}) {
  const studentId = pick(applicant, ["studentId", "userId"]);
  const name = pick(applicant, ["name", "studentName"], "Student");
  const email = pick(applicant, ["email", "studentEmail"], "");
  const appliedDate = pick(applicant, ["appliedDate", "appliedAt", "createdAt"]);

  if (compact) {
    return (
      <Link
        to={studentId ? `/company/students/${studentId}` : "#"}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-cyan-300/40 hover:bg-white/[0.06]"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 font-black text-white">
            {initials(name)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-black text-white">{name}</p>
            <p className="truncate text-xs text-slate-500">{email}</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 font-black text-white">
          {initials(name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xl font-black text-white">{name}</p>
          <p className="truncate text-sm text-slate-400">{email}</p>
          <p className="mt-1 text-xs text-slate-500">Applied {formatDate(appliedDate)}</p>
        </div>
        <StatusBadge status={pick(applicant, ["status"], "PENDING")} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Badge tone="cyan">
          <UserRound className="h-3 w-3" /> {pick(applicant, ["degree", "college"], "Profile")}
        </Badge>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {studentId && (
          <Link to={`/company/students/${studentId}`} className="sm:col-span-3">
            <GhostButton className="w-full">
              <Eye className="h-4 w-4" /> View student profile and resume
            </GhostButton>
          </Link>
        )}
        <GhostButton
          className="border-emerald-400/25 text-emerald-100"
          onClick={() => onSelect?.(applicant)}
        >
          Select
        </GhostButton>
        <GhostButton
          className="border-rose-400/25 text-rose-100"
          onClick={() => onReject?.(applicant)}
        >
          Reject
        </GhostButton>
        <GradientButton onClick={() => onInterview?.(applicant)}>
          <CalendarClock className="h-4 w-4" /> Interview
        </GradientButton>
      </div>
    </GlassCard>
  );
}
