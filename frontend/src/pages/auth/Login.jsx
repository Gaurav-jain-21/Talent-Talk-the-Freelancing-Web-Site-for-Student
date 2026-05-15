import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth";
import { Field, GhostButton, GlassCard, GradientButton } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { errorMessage } from "../../utils/format";
import { API_BASE_URL } from "../../api/client";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function continueWithGoogle() {
    window.location.assign(`${API_BASE_URL}/oauth2/authorization/google`);
  }

  return (
    <Page>
      <GlassCard hover={false} className="gradient-border p-8 shadow-[0_0_70px_rgba(99,102,241,0.18)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 text-xl font-black shadow-[0_0_50px_rgba(99,102,241,0.65)]">
            TT
          </div>
          <h1 className="text-4xl font-black gradient-text">Talent Talk</h1>
          <p className="mt-2 text-sm text-slate-400">Where Talent Meets Opportunity</p>
        </div>

        <form className="space-y-5" onSubmit={submit}>
          <Field
            label="Email address"
            icon={Mail}
            type="email"
            value={form.email}
            onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))}
            required
          />
          <div className="relative">
            <Field
              label="Password"
              icon={LockKeyhole}
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))}
              required
            />
            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-100" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <GradientButton type="submit" loading={loading} className="w-full">
            Sign In
          </GradientButton>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm font-bold text-cyan-200 hover:text-white">
              Forgot password?
            </Link>
          </div>
          <GhostButton type="button" className="w-full" onClick={continueWithGoogle}>
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-sm font-black text-slate-950">G</span>
            Continue with Google
          </GhostButton>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New here? <Link to="/register" className="font-bold text-cyan-200 hover:text-white">Create an account</Link>
        </p>
      </GlassCard>
    </Page>
  );
}
