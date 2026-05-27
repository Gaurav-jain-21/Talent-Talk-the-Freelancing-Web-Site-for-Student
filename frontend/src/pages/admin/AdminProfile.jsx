import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { GhostButton, GlassCard } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { useAuth } from "../../context/useAuth";
import { initials } from "../../utils/format";

export default function AdminProfile() {
  const { user, logout } = useAuth();

  return (
    <Page className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-cyan-500/10 p-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="grid h-24 w-24 place-items-center rounded-[2rem] bg-slate-950/50 text-3xl font-black text-white">
              {initials(user?.name)}
            </div>
            <div>
              <h2 className="text-4xl font-black text-white">{user?.name || "Admin"}</h2>
              <p className="mt-1 text-slate-300">{user?.email || "Admin account"}</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-bold text-[#e8dab2]">
                <ShieldCheck className="h-4 w-4" /> Administrator
              </p>
            </div>
          </div>
          <GhostButton className="border-rose-400/25 text-rose-100" onClick={logout}>
            <LogOut className="h-4 w-4" /> Logout
          </GhostButton>
        </div>
      </section>

      <GlassCard className="p-6">
        <h3 className="mb-5 flex items-center gap-2 text-xl font-black text-white">
          <UserRound className="h-5 w-5 text-cyan-100" /> Account
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Info label="Name" value={user?.name || "Admin"} />
          <Info label="Email" value={user?.email || "Not available"} />
          <Info label="Role" value={user?.role || "ADMIN"} />
          <Info label="User ID" value={user?.userId || "-"} />
        </div>
      </GlassCard>
    </Page>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}
