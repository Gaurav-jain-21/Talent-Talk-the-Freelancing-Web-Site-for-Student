import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Rocket } from "lucide-react";
import { jobApi, companyApi } from "../../api/services";
import JobCard from "../../components/JobCard";
import {
  Badge,
  Field,
  GhostButton,
  GlassCard,
  GradientButton,
  TextArea,
} from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { useAuth } from "../../context/AuthContext";
import { errorMessage } from "../../utils/format";

export default function PostJob() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [skill, setSkill] = useState("");
  const [companyProfile, setCompanyProfile] = useState(null);
  const [form, setForm] = useState({
    title: "",
    company: "",
    type: "Internship",
    description: "",
    location: "",
    salary: "",
    skills: [],
    openings: "",
    lastDate: "",
    companyId: user.userId,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch company profile to get company name
    const fetchCompanyProfile = async () => {
      try {
        const profile = await companyApi.profile(user.userId);
        setCompanyProfile(profile);
        if (profile?.companyName) {
          setForm((current) => ({
            ...current,
            company: profile.companyName,
            companyId: profile.companyId || user.userId,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch company profile", error);
      }
    };
    fetchCompanyProfile();
  }, [user.userId]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function addSkill() {
    if (!skill.trim()) return;
    update("skills", [...form.skills, skill.trim()]);
    setSkill("");
  }

  async function submit() {
    // Validate all required fields
    if (!form.title || form.title.length < 3) {
      toast.error("Job title must be at least 3 characters");
      return;
    }
    if (!form.company) {
      toast.error("Company name is required");
      return;
    }
    if (!form.location) {
      toast.error("Location is required");
      return;
    }
    if (!form.description || form.description.length < 20) {
      toast.error("Description must be at least 20 characters");
      return;
    }
    if (!form.openings || form.openings < 1) {
      toast.error("Number of openings must be at least 1");
      return;
    }
    if (!form.skills.length) {
      toast.error("Please add at least one skill requirement");
      return;
    }
    if (!form.lastDate) {
      toast.error("Last date to apply is required");
      return;
    }

    // Validate that the last date is in the future
    const selectedDate = new Date(form.lastDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      toast.error("Last date to apply must be in the future");
      return;
    }

    setLoading(true);
    try {
      await jobApi.post(form);
      toast.success("Job posted successfully! 🎉");
      setStep(1);
      setForm((current) => ({
        ...current,
        title: "",
        description: "",
        skills: [],
        company: companyProfile?.companyName || "",
        companyId: user.userId,
        openings: "",
        lastDate: "",
        location: "",
        salary: "",
        type: "Internship",
      }));
    } catch (error) {
      const message = errorMessage(error);
      toast.error(
        message || "Failed to post job. Please check all fields and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page className="grid gap-6 xl:grid-cols-[1fr_26rem]">
      <GlassCard hover={false} className="p-6">
        <h2 className="text-4xl font-black gradient-text">Post a job</h2>
        <div className="my-8 grid grid-cols-3 gap-3">
          {["Basic Info", "Details", "Preview"].map((label, index) => (
            <button
              key={label}
              onClick={() => setStep(index + 1)}
              className={`rounded-2xl px-3 py-3 text-sm font-bold ${step === index + 1 ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white" : "border border-white/10 text-slate-400"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <Field
              label="Job title"
              value={form.title}
              minLength={3}
              required
              onChange={(event) => update("title", event.target.value)}
            />
            <Field
              label="Company"
              value={form.company}
              required
              onChange={(event) => update("company", event.target.value)}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              {["Internship", "Full-time", "Part-time"].map((type) => (
                <button
                  key={type}
                  onClick={() => update("type", type)}
                  className={`tilt-card rounded-3xl border p-5 text-left font-black ${form.type === type ? "border-cyan-300/50 bg-cyan-400/10 text-white" : "border-white/10 bg-white/[0.04] text-slate-400"}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <TextArea
              label="Description"
              value={form.description}
              minLength={20}
              required
              onChange={(event) => update("description", event.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Location"
                value={form.location}
                required
                onChange={(event) => update("location", event.target.value)}
              />
              <Field
                label="Salary"
                value={form.salary}
                onChange={(event) => update("salary", event.target.value)}
              />
              <Field
                label="Openings"
                type="number"
                min="1"
                max="100"
                value={form.openings}
                required
                onChange={(event) => update("openings", event.target.value)}
              />
              <Field
                label="Last date"
                type="date"
                value={form.lastDate}
                required
                onChange={(event) => update("lastDate", event.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Field
                label="Skill"
                value={skill}
                onChange={(event) => setSkill(event.target.value)}
              />
              <GhostButton onClick={addSkill}>Add</GhostButton>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.skills.map((item) => (
                <Badge key={item} tone="cyan">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4">
              <p className="text-sm font-semibold text-cyan-100">
                ✓ Preview looks good? Click "Post Job Now" button at the bottom
                to publish!
              </p>
            </div>
            <JobCard
              job={form}
              actions={
                <GradientButton
                  loading={loading}
                  onClick={submit}
                  className="w-full py-3"
                >
                  <Rocket className="h-4 w-4" /> Launch Job
                </GradientButton>
              }
            />
            <GradientButton
              loading={loading}
              onClick={submit}
              className="w-full py-4 text-lg font-bold shadow-[0_0_50px_rgba(99,102,241,0.5)]"
            >
              <Rocket className="h-5 w-5" /> Publish Job Post
            </GradientButton>
          </div>
        )}

        <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row">
          <GhostButton
            disabled={step === 1}
            onClick={() => setStep((value) => Math.max(1, value - 1))}
            className="order-1"
          >
            Back
          </GhostButton>

          {step < 3 && (
            <GradientButton
              onClick={() => setStep((value) => value + 1)}
              className="order-2"
            >
              Next
            </GradientButton>
          )}

          {step === 3 && (
            <GradientButton
              loading={loading}
              onClick={submit}
              className="order-2 py-4 text-base font-bold shadow-[0_0_40px_rgba(99,102,241,0.4)]"
            >
              <Rocket className="h-5 w-5" /> Post Job Now
            </GradientButton>
          )}
        </div>
      </GlassCard>

      <div>
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-slate-500">
          Live Preview
        </p>
        <JobCard
          job={form}
          actions={<GhostButton className="w-full">Preview</GhostButton>}
        />
      </div>
    </Page>
  );
}
