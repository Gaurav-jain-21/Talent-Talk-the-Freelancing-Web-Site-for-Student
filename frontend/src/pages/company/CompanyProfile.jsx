/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Building2, KeyRound, Save } from "lucide-react";
import { authApi, companyApi } from "../../api/services";
import {
  Field,
  GhostButton,
  GlassCard,
  GradientButton,
  Skeleton,
  TextArea,
} from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { useAuth } from "../../context/useAuth";
import { errorMessage, initials, pick } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

const emptyProfile = {
  companyName: "",
  email: "",
  phone: "",
  website: "",
  industry: "",
  location: "",
  companySize: "",
  foundedYear: "",
  logoUrl: "",
  description: "",
};

export default function CompanyProfile() {
  const { user } = useAuth();
  const profileQuery = useAsync(() => companyApi.profile(user.userId), [user.userId], { toast: false });
  const [draft, setDraft] = useState(emptyProfile);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const profile = profileQuery.data;

  useEffect(() => {
    const currentProfile = profile || {};
    setDraft({
      ...emptyProfile,
      userId: user.userId,
      companyName: pick(currentProfile, ["companyName"], user.name || ""),
      email: pick(currentProfile, ["email"], user.email || ""),
      phone: pick(currentProfile, ["phone"], ""),
      website: pick(currentProfile, ["website"], ""),
      industry: pick(currentProfile, ["industry"], ""),
      location: pick(currentProfile, ["location"], ""),
      companySize: pick(currentProfile, ["companySize"], ""),
      foundedYear: pick(currentProfile, ["foundedYear"], ""),
      logoUrl: pick(currentProfile, ["logoUrl"], ""),
      description: pick(currentProfile, ["description"], ""),
    });
  }, [profile, user.email, user.name, user.userId]);

  function update(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updatePassword(key, value) {
    setPasswords((current) => ({ ...current, [key]: value }));
  }

  async function saveProfile() {
    if (!draft.companyName.trim()) {
      toast.error("Company name is required");
      return;
    }
    if (!draft.email.trim()) {
      toast.error("Company email is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...draft,
        userId: user.userId,
        phone: draft.phone || null,
        website: draft.website || null,
        industry: draft.industry || null,
        location: draft.location || null,
        companySize: draft.companySize || null,
        foundedYear: draft.foundedYear ? Number(draft.foundedYear) : null,
        logoUrl: draft.logoUrl || null,
        description: draft.description || null,
      };
      if (profile?.id) {
        await companyApi.updateProfile(user.userId, payload);
      } else {
        await companyApi.createProfile(payload);
      }
      toast.success("Company profile saved");
      profileQuery.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      await authApi.changePassword({
        userId: user.userId,
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success("Password changed");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setChangingPassword(false);
    }
  }

  if (profileQuery.loading) {
    return <Page><Skeleton className="h-96 rounded-[2rem]" /></Page>;
  }

  return (
    <Page className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-cyan-500/10 p-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="grid h-24 w-24 place-items-center rounded-[2rem] bg-slate-950/50 text-3xl font-black text-white">
              {draft.logoUrl ? (
                <img src={draft.logoUrl} alt="" className="h-full w-full rounded-[2rem] object-cover" />
              ) : (
                initials(draft.companyName || user.name)
              )}
            </div>
            <div>
              <h2 className="text-4xl font-black text-white">{draft.companyName || "Company Profile"}</h2>
              <p className="mt-1 text-slate-300">{draft.email}</p>
              <p className="mt-1 text-sm text-slate-400">{draft.industry || "Add your company details"}</p>
            </div>
          </div>
          <GradientButton loading={saving} onClick={saveProfile}>
            <Save className="h-4 w-4" /> Save Profile
          </GradientButton>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
        <GlassCard className="p-6">
          <h3 className="mb-5 flex items-center gap-2 text-xl font-black text-white">
            <Building2 className="h-5 w-5 text-cyan-100" /> Company Details
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company name" value={draft.companyName} onChange={(event) => update("companyName", event.target.value)} />
            <Field label="Email" type="email" value={draft.email} onChange={(event) => update("email", event.target.value)} />
            <Field label="Phone" value={draft.phone} onChange={(event) => update("phone", event.target.value)} />
            <Field label="Website" value={draft.website} onChange={(event) => update("website", event.target.value)} />
            <Field label="Industry" value={draft.industry} onChange={(event) => update("industry", event.target.value)} />
            <Field label="Location" value={draft.location} onChange={(event) => update("location", event.target.value)} />
            <Field label="Company size" value={draft.companySize} onChange={(event) => update("companySize", event.target.value)} />
            <Field label="Founded year" type="number" min="1900" max="2026" value={draft.foundedYear} onChange={(event) => update("foundedYear", event.target.value)} />
            <Field label="Logo URL" className="sm:col-span-2" value={draft.logoUrl} onChange={(event) => update("logoUrl", event.target.value)} />
            <TextArea label="Description" className="sm:col-span-2" value={draft.description} onChange={(event) => update("description", event.target.value)} />
          </div>
        </GlassCard>

        <GlassCard className="h-fit p-6">
          <h3 className="mb-5 flex items-center gap-2 text-xl font-black text-white">
            <KeyRound className="h-5 w-5 text-cyan-100" /> Change Password
          </h3>
          <div className="space-y-4">
            <Field label="Current password" type="password" value={passwords.currentPassword} onChange={(event) => updatePassword("currentPassword", event.target.value)} />
            <Field label="New password" type="password" value={passwords.newPassword} onChange={(event) => updatePassword("newPassword", event.target.value)} />
            <Field label="Confirm password" type="password" value={passwords.confirmPassword} onChange={(event) => updatePassword("confirmPassword", event.target.value)} />
            <GradientButton loading={changingPassword} onClick={changePassword} className="w-full">
              Update Password
            </GradientButton>
            <GhostButton className="w-full" onClick={() => setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" })}>
              Clear
            </GhostButton>
          </div>
        </GlassCard>
      </div>
    </Page>
  );
}
