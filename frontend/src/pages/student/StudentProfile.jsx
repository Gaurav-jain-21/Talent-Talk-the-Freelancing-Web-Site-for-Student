import { useState } from "react";
import { FileUp, FolderGit2, Save, Plus, X, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { studentApi } from "../../api/services";
import ResumePreviewModal from "../../components/ResumePreviewModal";
import {
  Badge,
  EmptyState,
  Field,
  GhostButton,
  GlassCard,
  GradientButton,
  Skeleton,
  TextArea,
} from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { useAuth } from "../../context/useAuth";
import { asArray, errorMessage, initials, pick } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

export default function StudentProfile() {
  const { user } = useAuth();
  const profileQuery = useAsync(
    () => studentApi.profile(user.userId),
    [user.userId],
    { toast: false },
  );
  const projectsQuery = useAsync(
    () => studentApi.projects(user.userId),
    [user.userId],
    { toast: false },
  );
  const profile = profileQuery.data || {};
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState({});
  const [skill, setSkill] = useState("");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [addingProject, setAddingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    techStack: "",
    projectUrl: "",
  });
  const skills = asArray(pick(edit ? draft : profile, ["skills"], []));
  const projects = asArray(projectsQuery.data);
  const resumeUrl = value("resumeUrl", "");

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
      profileQuery.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  async function ensureProfileExists() {
    if (profile?.id) return profile;

    const created = await studentApi.createProfile({
      userId: user.userId,
      fullName: value("fullName", user.name),
      email: value("email", user.email),
      college: value("college", ""),
      degree: value("degree", ""),
      graduationYear: value("graduationYear", new Date().getFullYear()),
      bio: value("bio", ""),
      skills,
      resumeUrl,
      githubUrl: value("githubUrl", ""),
      linkedinUrl: value("linkedinUrl", ""),
      workStatus: value("workStatus", "AVAILABLE"),
    });
    profileQuery.setData(created);
    return created;
  }

  function addSkill() {
    if (!skill.trim()) return;
    update("skills", [...skills, skill.trim()]);
    setSkill("");
  }

  async function addProject() {
    if (!projectForm.title.trim()) {
      toast.error("Project title is required");
      return;
    }
    setAddingProject(true);
    try {
      await ensureProfileExists();
      await studentApi.addProject(user.userId, projectForm);
      toast.success("Project added successfully");
      setProjectForm({
        title: "",
        description: "",
        techStack: "",
        projectUrl: "",
      });
      setShowProjectForm(false);
      await projectsQuery.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setAddingProject(false);
    }
  }

  function removeSkill(skillToRemove) {
    const updatedSkills = skills.filter((s) => s !== skillToRemove);
    update("skills", updatedSkills);
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
              <h2 className="text-4xl font-black text-white">
                {value("fullName", user.name)}
              </h2>
              <p className="mt-1 text-slate-300">
                {value("email", user.email)}
              </p>
              <Badge tone="green" className="mt-3">
                {value("workStatus", "Open to work")}
              </Badge>
            </div>
          </div>
          {edit ? (
            <GradientButton onClick={save}>
              <Save className="h-4 w-4" /> Save
            </GradientButton>
          ) : (
            <GhostButton
              onClick={() => {
                setDraft({
                  userId: user.userId,
                  fullName: user.name,
                  email: user.email,
                  ...profile,
                });
                setEdit(true);
              }}
            >
              Edit Profile
            </GhostButton>
          )}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <GlassCard className="p-6">
          <h3 className="mb-5 text-xl font-black text-white">Personal Info</h3>
          <div className="space-y-4">
            <Field
              label="Name"
              value={value("fullName", user.name)}
              disabled={!edit}
              onChange={(event) => update("fullName", event.target.value)}
            />
            <Field
              label="Email"
              value={value("email", user.email)}
              disabled={!edit}
              onChange={(event) => update("email", event.target.value)}
            />
            <Field
              label="College"
              value={value("college", "")}
              disabled={!edit}
              onChange={(event) => update("college", event.target.value)}
            />
            <Field
              label="Degree"
              value={value("degree", "")}
              disabled={!edit}
              onChange={(event) => update("degree", event.target.value)}
            />
            <Field
              label="Graduation Year"
              type="number"
              value={value("graduationYear", new Date().getFullYear())}
              disabled={!edit}
              onChange={(event) => update("graduationYear", event.target.value)}
            />
            <TextArea
              label="Bio"
              value={value("bio", "")}
              disabled={!edit}
              onChange={(event) => update("bio", event.target.value)}
            />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="mb-5 text-xl font-black text-white">Skills</h3>
          <div className="mb-5 flex flex-wrap gap-2">
            {skills.map((item) => (
              <div key={item} className="relative">
                <Badge tone="cyan">{item}</Badge>
                {edit && (
                  <button
                    onClick={() => removeSkill(item)}
                    className="absolute -right-2 -top-2 rounded-full bg-rose-600 p-0.5 text-white hover:bg-rose-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {edit && (
            <div className="flex gap-2">
              <Field
                label="Add skill"
                value={skill}
                onChange={(event) => setSkill(event.target.value)}
              />
              <GradientButton onClick={addSkill}>Add</GradientButton>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="mb-5 text-xl font-black text-white">Resume</h3>
          {resumeUrl ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                <p className="text-sm text-emerald-100">Resume uploaded</p>
              </div>
              <GhostButton
                onClick={() => setShowResumeModal(true)}
                className="w-full"
              >
                <Eye className="h-4 w-4" /> View Resume
              </GhostButton>
              {edit && (
                <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-100 backdrop-blur-xl transition hover:border-cyan-300/40 hover:bg-cyan-400/10">
                  <FileUp className="h-4 w-4" /> Update Resume
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={uploadResume}
                  />
                </label>
              )}
            </div>
          ) : (
            <label className="grid min-h-44 cursor-pointer place-items-center rounded-3xl border border-dashed border-cyan-300/35 bg-cyan-400/5 p-6 text-center transition hover:bg-cyan-400/10">
              <FileUp className="mb-3 h-8 w-8 text-cyan-100" />
              <span className="font-bold text-white">
                Drop or select your resume
              </span>
              <span className="mt-1 text-sm text-slate-500">
                PDF/DOC formats supported
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={uploadResume}
              />
            </label>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-black text-white">Projects</h3>
            <GradientButton
              onClick={() => setShowProjectForm(!showProjectForm)}
              className="p-2"
              aria-label="Add project"
            >
              <Plus className="h-4 w-4" />
            </GradientButton>
          </div>
          {projects.length ? (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={pick(project, ["id", "projectId", "title"])}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <p className="font-bold text-white">
                    {pick(project, ["title", "name"], "Project")}
                  </p>
                  {pick(project, ["techStack"], "") && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {asArray(pick(project, ["techStack"], "")).map((tech) => (
                        <Badge key={tech} tone="indigo" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-sm text-slate-400">
                    {pick(project, ["description"], "")}
                  </p>
                  {pick(project, ["projectUrl"], "") && (
                    <a
                      href={pick(project, ["projectUrl"], "")}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block"
                    >
                      <GhostButton className="text-xs">
                        View Project
                      </GhostButton>
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FolderGit2}
              title="No projects yet"
              message="Add your first project to showcase your work."
            />
          )}
        </GlassCard>
      </div>

      {showProjectForm && (
        <GlassCard className="p-6 xl:col-span-2">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-white">Add Project</h3>
              <p className="mt-1 text-sm text-slate-500">
                Add a portfolio item companies can review with your application.
              </p>
            </div>
            <button
              onClick={() => setShowProjectForm(false)}
              className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Close project form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form
            className="grid gap-4 lg:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              addProject();
            }}
          >
            <Field
              label="Project Title"
              value={projectForm.title}
              onChange={(e) =>
                setProjectForm({ ...projectForm, title: e.target.value })
              }
              placeholder="Enter project title"
            />
            <Field
              label="Tech Stack (comma-separated)"
              value={projectForm.techStack}
              onChange={(e) =>
                setProjectForm({ ...projectForm, techStack: e.target.value })
              }
              placeholder="e.g., React, Node.js, MongoDB"
            />
            <TextArea
              label="Project Description"
              className="lg:col-span-2"
              value={projectForm.description}
              onChange={(e) =>
                setProjectForm({ ...projectForm, description: e.target.value })
              }
              placeholder="Describe your project"
            />
            <Field
              label="Project URL"
              type="url"
              className="lg:col-span-2"
              value={projectForm.projectUrl}
              onChange={(e) =>
                setProjectForm({ ...projectForm, projectUrl: e.target.value })
              }
              placeholder="https://github.com/..."
            />
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-2">
              <GradientButton type="submit" loading={addingProject} className="flex-1">
                Add Project
              </GradientButton>
              <GhostButton
                onClick={() => setShowProjectForm(false)}
                className="flex-1"
              >
                Cancel
              </GhostButton>
            </div>
          </form>
        </GlassCard>
      )}

      {showResumeModal && resumeUrl && (
        <ResumePreviewModal
          userId={user.userId}
          onClose={() => setShowResumeModal(false)}
        />
      )}
    </Page>
  );
}
