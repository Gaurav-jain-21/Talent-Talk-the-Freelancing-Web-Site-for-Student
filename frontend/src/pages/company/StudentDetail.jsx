import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, FileText, GraduationCap } from "lucide-react";
import { companyApi, studentApi } from "../../api/services";
import { Badge, EmptyState, GhostButton, GlassCard, Skeleton } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { asArray, initials, pick } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

export default function StudentDetail() {
  const { userId } = useParams();
  const profile = useAsync(() => companyApi.student(userId), [userId]);
  const projects = useAsync(() => studentApi.projects(userId), [userId], { toast: false });
  const student = profile.data || {};

  if (profile.loading) return <Page><Skeleton className="h-96 rounded-[2rem]" /></Page>;

  return (
    <Page className="space-y-6">
      <Link to="/company/students"><GhostButton><ArrowLeft className="h-4 w-4" /> Back</GhostButton></Link>
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-cyan-500/10 p-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="grid h-24 w-24 place-items-center rounded-[2rem] bg-slate-950/50 text-3xl font-black">{initials(pick(student, ["fullName", "name"]))}</div>
            <div>
              <h2 className="text-4xl font-black text-white">{pick(student, ["fullName", "name"], "Student")}</h2>
              <p className="mt-1 text-slate-300">{pick(student, ["email"], "")}</p>
              <Badge tone="green" className="mt-3">{pick(student, ["workStatus"], "Open to work")}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <GhostButton><FileText className="h-4 w-4" /> Resume</GhostButton>
            <GhostButton><ExternalLink className="h-4 w-4" /> GitHub</GhostButton>
            <GhostButton><ExternalLink className="h-4 w-4" /> LinkedIn</GhostButton>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <GlassCard className="p-6">
          <h3 className="mb-4 text-xl font-black text-white">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {asArray(pick(student, ["skills"], [])).map((skill) => <Badge key={skill} tone="cyan">{skill}</Badge>)}
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <h3 className="mb-4 text-xl font-black text-white">Education</h3>
          <p className="text-white">{pick(student, ["college"], "")}</p>
          <p className="text-sm text-slate-400">{pick(student, ["degree"], "")}</p>
        </GlassCard>
      </div>

      <section className="space-y-4">
        <h3 className="text-2xl font-black text-white">Projects</h3>
        {asArray(projects.data).length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {asArray(projects.data).map((project) => (
              <GlassCard key={pick(project, ["id", "title"])} className="p-5">
                <h4 className="text-lg font-black text-white">{pick(project, ["title", "name"], "Project")}</h4>
                <p className="mt-2 text-sm text-slate-400">{pick(project, ["description"], "")}</p>
              </GlassCard>
            ))}
          </div>
        ) : (
          <EmptyState icon={GraduationCap} title="No projects published" message="Projects will show when this student adds them." />
        )}
      </section>
    </Page>
  );
}
