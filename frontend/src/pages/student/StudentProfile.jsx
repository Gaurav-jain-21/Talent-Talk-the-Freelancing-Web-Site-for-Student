import { useState } from "react";
import { FileUp, FolderGit2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { studentApi } from "../../api/services";
import { Badge, EmptyState, Field, GhostButton, GlassCard, GradientButton, Skeleton, TextArea } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { useAuth } from "../../context/useAuth";
import { asArray, errorMessage, initials, pick } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

export default function StudentProfile() {
  const { user } = useAuth();
  const profileQuery = useAsync(() => studentApi.profile(user.userId), [user.userId], { toast: false });
  const projectsQuery = useAsync(() => studentApi.projects(user.userId), [user.userId], { toast: false });
  const profile = profileQuery.data || {};
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState({});
  const [skill, setSkill] = useState("");
  const skills = asArray(pick(edit ? draft : profile, ["skills"], []));
  const projects = asArray(projectsQuery.data);

  function value(key, fallback = "") {
    return pick(edit ? draft : profile, [key], fallback);
  }

  function update(key, nextValue) {
    setDraft((current) => ({ ...profile, ...current, [key]: nextValue }));
  }

  async function save() {
    try {
      const payload = {
        userId: user.userId,
        fullName: user.name,
        email: user.email,
        ...profile,
        ...draft,
      };
      if (profile?.id) {
        await studentApi.updateProfile(user.userId, payload);
      } else {
        await studentApi.createProfile(payload);
      }
      toast.success("Profile updated");
      setEdit(false);
      profileQuery.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  async function uploadResume(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("resume", file);
    try {
      await studentApi.uploadResume(user.userId, formData);
      toast.success("Resume uploaded");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  function addSkill() {
    if (!skill.trim()) return;
    update("skills", [...skills, skill.trim()]);
    setSkill("");
  }

  if (profileQuery.loading) {
    return (
      <Page className="space-y-5">
        <Skeleton className="h-56 rounded-[2rem]" />
        <Skeleton className="h-72 rounded-[2rem]" />
      </Page>
    );
  }

  return (
    <Page className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-600/35 via-purple-600/20 to-cyan-500/15 p-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="grid h-24 w-24 place-items-center rounded-[2rem] border border-white/20 bg-slate-950/40 text-3xl font-black text-white shadow-[0_0_45px_rgba(6,182,212,0.22)]">
              {initials(value("fullName", user.name))}
            </div>
            <div>
              <h2 className="text-4xl font-black text-white">{value("fullName", user.name)}</h2>
              <p className="mt-1 text-slate-300">{value("email", user.email)}</p>
              <Badge tone="green" className="mt-3">{value("workStatus", "Open to work")}</Badge>
            </div>
          </div>
          {edit ? (
            <GradientButton onClick={save}><Save className="h-4 w-4" /> Save</GradientButton>
          ) : (
            <GhostButton onClick={() => { setDraft({ userId: user.userId, fullName: user.name, email: user.email, ...profile }); setEdit(true); }}>Edit Profile</GhostButton>
          )}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <GlassCard className="p-6">
          <h3 className="mb-5 text-xl font-black text-white">Personal Info</h3>
          <div className="space-y-4">
            <Field label="Name" value={value("fullName", user.name)} disabled={!edit} onChange={(event) => update("fullName", event.target.value)} />
            <Field label="Email" value={value("email", user.email)} disabled={!edit} onChange={(event) => update("email", event.target.value)} />
            <Field label="College" value={value("college", "")} disabled={!edit} onChange={(event) => update("college", event.target.value)} />
            <TextArea label="Bio" value={value("bio", "")} disabled={!edit} onChange={(event) => update("bio", event.target.value)} />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="mb-5 text-xl font-black text-white">Skills</h3>
          <div className="mb-5 flex flex-wrap gap-2">
            {skills.map((item) => <Badge key={item} tone="cyan">{item}</Badge>)}
          </div>
          {edit && (
            <div className="flex gap-2">
              <Field label="Add skill" value={skill} onChange={(event) => setSkill(event.target.value)} />
              <GradientButton onClick={addSkill}>Add</GradientButton>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="mb-5 text-xl font-black text-white">Resume</h3>
          <label className="grid min-h-44 cursor-pointer place-items-center rounded-3xl border border-dashed border-cyan-300/35 bg-cyan-400/5 p-6 text-center transition hover:bg-cyan-400/10">
            <FileUp className="mb-3 h-8 w-8 text-cyan-100" />
            <span className="font-bold text-white">Drop or select your resume</span>
            <span className="mt-1 text-sm text-slate-500">PDF/DOC upload uses multipart API</span>
            <input type="file" className="hidden" onChange={uploadResume} />
          </label>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="mb-5 text-xl font-black text-white">Projects</h3>
          {projects.length ? (
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={pick(project, ["id", "projectId", "title"])} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="font-bold text-white">{pick(project, ["title", "name"], "Project")}</p>
                  <p className="mt-1 text-sm text-slate-400">{pick(project, ["description"], "")}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={FolderGit2} title="No projects yet" message="Projects added through the API will appear here." />
          )}
        </GlassCard>
      </div>
    </Page>
  );
}
