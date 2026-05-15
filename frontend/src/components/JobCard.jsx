import { BriefcaseBusiness, CalendarClock, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, GhostButton, GlassCard, GradientButton } from "./ui/Primitives";
import { daysUntil, formatDate, initials, pick } from "../utils/format";

export default function JobCard({ job, onApply, applied = false, actions }) {
  const title = pick(job, ["title", "jobTitle", "name"], "Untitled role");
  const company = pick(job, ["companyName", "company", "organization"], "Company");
  const location = pick(job, ["location", "city"], "Remote");
  const jobType = pick(job, ["jobType", "type", "employmentType"], "Role");
  const salary = pick(job, ["salary", "salaryRange", "package"], "");
  const skills = pick(job, ["skillsRequired", "skills", "requiredSkills"], []);
  const openings = pick(job, ["openings", "vacancies"], "");
  const lastDate = pick(job, ["lastDateToApply", "lastDate", "deadline", "applicationDeadline"], "");
  const id = pick(job, ["id", "jobId"], "");
  const urgent = daysUntil(lastDate);

  return (
    <GlassCard className="tilt-card flex h-full flex-col p-6">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 font-black text-white shadow-[0_0_25px_rgba(99,102,241,0.35)]">
          {initials(company)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-black text-white">{title}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
            <BriefcaseBusiness className="h-4 w-4 text-cyan-200" />
            {company}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Badge tone="cyan">{jobType}</Badge>
        {salary && <Badge tone="green">{salary}</Badge>}
        {openings && <Badge tone="indigo"><Users className="h-3 w-3" /> {openings} openings</Badge>}
      </div>

      <div className="mt-5 grid gap-2 text-sm text-slate-400">
        <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-purple-200" /> {location}</p>
        <p className={`flex items-center gap-2 ${urgent !== null && urgent < 7 ? "text-rose-200" : ""}`}>
          <CalendarClock className="h-4 w-4" />
          Last date {formatDate(lastDate)}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {(Array.isArray(skills) ? skills : String(skills).split(",")).filter(Boolean).slice(0, 6).map((skill) => (
          <span key={skill} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-300">
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-auto flex gap-3 pt-6">
        {actions || (
          <>
            {id && (
              <Link className="flex-1" to={`/company/jobs/${id}/applicants`}>
                <GhostButton className="w-full">Applicants</GhostButton>
              </Link>
            )}
            {onApply && (
              applied ? (
                <GhostButton disabled className="flex-1 border-emerald-400/30 bg-emerald-400/10 text-emerald-100">Applied</GhostButton>
              ) : (
                <GradientButton className="flex-1" onClick={() => onApply(job)}>Apply Now</GradientButton>
              )
            )}
          </>
        )}
      </div>
    </GlassCard>
  );
}
