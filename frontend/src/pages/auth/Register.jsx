import { useState } from "react";
import { Building2, GraduationCap, Mail, Sparkles, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "../../api/services";
import { Field, GlassCard, GradientButton, GhostButton } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { errorMessage } from "../../utils/format";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    role: "STUDENT",
    name: "",
    email: "",
    password: "",
    college: "",
    companyName: "",
  });

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const message = await authApi.register(form);
      toast.success(message || "Account created. Check your email to verify before login.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <GlassCard hover={false} className="gradient-border p-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-200">Join Talent Talk</p>
          <h1 className="mt-2 text-4xl font-black gradient-text">Start your portal</h1>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3">
          {[1, 2].map((item) => (
            <div key={item} className={`h-2 rounded-full ${step >= item ? "bg-gradient-to-r from-indigo-500 to-cyan-400" : "bg-white/10"}`} />
          ))}
        </div>

        {step === 1 ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["STUDENT", "I am a Student", GraduationCap, "from-cyan-500/25 to-indigo-500/20"],
                ["COMPANY", "I am a Company", Building2, "from-purple-500/25 to-indigo-500/20"],
              ].map(([role, label, Icon, gradient]) => (
                <button key={role} onClick={() => update("role", role)} className={`tilt-card rounded-3xl border p-6 text-left transition ${form.role === role ? "border-cyan-300/50 bg-cyan-400/10" : "border-white/10 bg-white/[0.04]"}`}>
                  <div className={`mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${gradient} text-cyan-100`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <p className="text-lg font-black text-white">{label}</p>
                  <p className="mt-2 text-sm text-slate-500">Build your opportunity graph.</p>
                </button>
              ))}
            </div>
            <GradientButton className="w-full" onClick={() => setStep(2)}>
              Continue <Sparkles className="h-4 w-4" />
            </GradientButton>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={submit}>
            <Field label="Full name" icon={UserRound} value={form.name} onChange={(event) => update("name", event.target.value)} required />
            <Field label="Email address" icon={Mail} type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required />
            <Field label="Password" type="password" value={form.password} onChange={(event) => update("password", event.target.value)} required minLength={6} />
            {form.role === "STUDENT" ? (
              <Field label="College" value={form.college} onChange={(event) => update("college", event.target.value)} />
            ) : (
              <Field label="Company name" value={form.companyName} onChange={(event) => update("companyName", event.target.value)} />
            )}
            <div className="grid grid-cols-2 gap-3">
              <GhostButton onClick={() => setStep(1)}>Back</GhostButton>
              <GradientButton type="submit" loading={loading}>Create account</GradientButton>
            </div>
          </form>
        )}
      </GlassCard>
    </Page>
  );
}
