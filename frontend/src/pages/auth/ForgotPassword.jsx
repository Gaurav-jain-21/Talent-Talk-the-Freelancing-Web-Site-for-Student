import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { KeyRound, LockKeyhole, Mail } from "lucide-react";
import { authApi } from "../../api/services";
import { Field, GhostButton, GlassCard, GradientButton } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { errorMessage } from "../../utils/format";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function sendCode(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const message = await authApi.forgotPassword({ email: form.email });
      toast.success(message || "Verification code sent to your Gmail");
      setStep("reset");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(event) {
    event.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const message = await authApi.resetPassword({
        email: form.email,
        otp: form.otp,
        newPassword: form.newPassword,
      });
      toast.success(message || "Password reset successfully");
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
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 text-white shadow-[0_0_50px_rgba(99,102,241,0.55)]">
            <KeyRound className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black gradient-text">Reset Password</h1>
          <p className="mt-2 text-sm text-slate-400">Verify your Gmail and choose a new password.</p>
        </div>

        {step === "email" ? (
          <form className="space-y-5" onSubmit={sendCode}>
            <Field
              label="Gmail address"
              icon={Mail}
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              required
            />
            <GradientButton type="submit" loading={loading} className="w-full">
              Send verification code
            </GradientButton>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={resetPassword}>
            <Field
              label="Gmail address"
              icon={Mail}
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              required
            />
            <Field
              label="6 digit code"
              icon={KeyRound}
              inputMode="numeric"
              maxLength={6}
              value={form.otp}
              onChange={(event) => update("otp", event.target.value.replace(/\D/g, ""))}
              required
            />
            <Field
              label="New password"
              icon={LockKeyhole}
              type="password"
              minLength={6}
              value={form.newPassword}
              onChange={(event) => update("newPassword", event.target.value)}
              required
            />
            <Field
              label="Confirm password"
              icon={LockKeyhole}
              type="password"
              minLength={6}
              value={form.confirmPassword}
              onChange={(event) => update("confirmPassword", event.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <GhostButton onClick={() => setStep("email")}>Back</GhostButton>
              <GradientButton type="submit" loading={loading}>
                Reset
              </GradientButton>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Remember password? <Link to="/login" className="font-bold text-cyan-200 hover:text-white">Login</Link>
        </p>
      </GlassCard>
    </Page>
  );
}
