import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  GraduationCap,
  Eye,
} from "lucide-react";
import { useState } from "react";
import { companyApi, studentApi } from "../../api/services";
import ResumePreviewModal from "../../components/ResumePreviewModal";
import {
  Badge,
  EmptyState,
  GhostButton,
  GlassCard,
  Skeleton,
} from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { asArray, initials, pick } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

export default function StudentDetail() {
  const [showResumeModal, setShowResumeModal] = useState(false);
  const { userId } = useParams();
  const profile = useAsync(() => companyApi.student(userId), [userId]);
  const projects = useAsync(() => studentApi.projects(userId), [userId], {
    toast: false,
  });
  const student = profile.data || {};
  const resumeUrl = pick(student, ["resumeUrl", "resume", "resumeLink"], "");
  const githubUrl = pick(student, ["githubUrl", "github", "githubLink"], "");
  const linkedinUrl = pick(
    student,
    ["linkedinUrl", "linkedin", "linkedInUrl", "linkedinLink"],
    "",
  );
  const skills = asArray(pick(student, ["skills"], []));

  if (profile.loading)
    return (
      <Page>
        <Skeleton className="h-96 rounded-[2rem]" />
      </Page>
    );

  return (
    <Page className="space-y-6">
      <Link to="/company/students">
        <GhostButton>
          <ArrowLeft className="h-4 w-4" /> Back
        </GhostButton>
      </Link>
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-cyan-500/10 p-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="grid h-24 w-24 place-items-center rounded-[2rem] bg-slate-950/50 text-3xl font-black">
              {initials(pick(student, ["fullName", "name"]))}
            </div>
            <div>
              <h2 className="text-4xl font-black text-white">
                {pick(student, ["fullName", "name"], "Student")}
              </h2>
              <p className="mt-1 text-slate-300">
                {pick(student, ["email"], "")}
              </p>
              <Badge tone="green" className="mt-3">
                {pick(student, ["workStatus"], "Open to work")}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {resumeUrl ? (
              <GhostButton onClick={() => setShowResumeModal(true)}>
                <Eye className="h-4 w-4" /> View Resume
              </GhostButton>
            ) : (
              <GhostButton disabled>
                <FileText className="h-4 w-4" /> No Resume
              </GhostButton>
            )}
            {githubUrl && (
              <a href={githubUrl} target="_blank" rel="noreferrer">
                <GhostButton>
                  <ExternalLink className="h-4 w-4" /> GitHub
                </GhostButton>
              </a>
            )}
            {linkedinUrl && (
              <a href={linkedinUrl} target="_blank" rel="noreferrer">
                <GhostButton>
                  <ExternalLink className="h-4 w-4" /> LinkedIn
                </GhostButton>
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <GlassCard className="p-6">
          <h3 className="mb-4 text-xl font-black text-white">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.length ? (
              skills.map((skill) => (
                <Badge key={skill} tone="cyan">
                  {skill}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-slate-400">No skills added yet</p>
            )}
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <h3 className="mb-4 text-xl font-black text-white">Education</h3>
          <p className="text-white">
            {pick(student, ["college"], "Not specified")}
          </p>
          <p className="text-sm text-slate-400">
            {pick(student, ["degree"], "")}
          </p>
          {pick(student, ["graduationYear"], "") && (
            <p className="mt-2 text-sm text-slate-400">
              Graduation: {pick(student, ["graduationYear"], "")}
            </p>
          )}
        </GlassCard>
        <GlassCard className="p-6 xl:col-span-2">
          <h3 className="mb-4 text-xl font-black text-white">About</h3>
          <p className="text-sm leading-6 text-slate-400">
            {pick(student, ["bio", "about"], "No bio added yet.")}
          </p>
        </GlassCard>
      </div>

      <section className="space-y-4">
        <h3 className="text-2xl font-black text-white">Projects</h3>
        {asArray(projects.data).length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {asArray(projects.data).map((project) => (
              <GlassCard key={pick(project, ["id", "title"])} className="p-5">
                <h4 className="text-lg font-black text-white">
                  {pick(project, ["title", "name"], "Project")}
                </h4>
                {pick(project, ["techStack"], "") && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {asArray(pick(project, ["techStack"], "")).map((tech) => (
                      <Badge key={tech} tone="indigo" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-sm text-slate-400">
                  {pick(project, ["description"], "")}
                </p>
                {pick(project, ["projectUrl"], "") && (
                  <a
                    href={pick(project, ["projectUrl"], "")}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block"
                  >
                    <GhostButton className="text-xs">
                      <ExternalLink className="h-3 w-3" /> View Project
                    </GhostButton>
                  </a>
                )}
              </GlassCard>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={GraduationCap}
            title="No projects published"
            message="This student hasn't added any projects yet."
          />
        )}
      </section>

      {showResumeModal && resumeUrl && (
        <ResumePreviewModal
          userId={userId}
          sourceUrl={resumeUrl}
          onClose={() => setShowResumeModal(false)}
        />
      )}
    </Page>
  );
}
