import { Loader2, Search, X } from "lucide-react";
import { statusTone } from "../../utils/format";

const toneClasses = {
  indigo: "border-indigo-400/30 bg-indigo-500/10 text-indigo-100 shadow-indigo-500/20",
  green: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100 shadow-emerald-500/20",
  red: "border-rose-400/30 bg-rose-500/10 text-rose-100 shadow-rose-500/20",
  yellow: "border-amber-400/30 bg-amber-500/10 text-amber-100 shadow-amber-500/20",
  cyan: "border-cyan-400/30 bg-cyan-500/10 text-cyan-100 shadow-cyan-500/20",
  slate: "border-slate-400/20 bg-slate-500/10 text-slate-200 shadow-slate-500/20",
};

export function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#e8dab2] text-sm font-black text-[#1a1d1f]">
        TT
      </div>
      {!compact && (
        <div>
          <p className="text-lg font-black leading-tight text-[#e8dab2]">Talent Talk</p>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#c0d6df]/70">Freelance Portal</p>
        </div>
      )}
    </div>
  );
}

export function GradientButton({ children, className = "", loading = false, type = "button", ...props }) {
  return (
    <button
      type={type}
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[#e8dab2] px-5 py-3 text-sm font-bold text-[#1a1d1f] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function GhostButton({ children, className = "", type = "button", ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-[#e8e8e8] transition hover:border-[#c0d6df]/40 hover:bg-[#4f6d7a]/25 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function GlassCard({ children, className = "", hover = true, ...props }) {
  return (
    <div className={`glass-card ${hover ? "card-hover" : ""} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Field({ label, icon: Icon, className = "", ...props }) {
  return (
    <label className={`floating-field ${className}`}>
      {Icon && <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-200/70" />}
      <input placeholder=" " className={Icon ? "pl-11" : ""} {...props} />
      <span className={Icon ? "left-11" : ""}>{label}</span>
    </label>
  );
}

export function TextArea({ label, className = "", ...props }) {
  return (
    <label className={`floating-field ${className}`}>
      <textarea placeholder=" " rows={5} {...props} />
      <span>{label}</span>
    </label>
  );
}

export function SearchBox({ value, onChange, placeholder = "Search" }) {
  return (
    <div className="relative">
      <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#c0d6df]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-white/10 bg-[#2c3539]/80 py-4 pl-14 pr-5 text-base text-[#e8dab2] outline-none transition focus:border-[#e8dab2]/70"
      />
    </div>
  );
}

export function Badge({ children, tone = "indigo", className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-lg ${toneClasses[tone] || toneClasses.indigo} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  return <Badge tone={statusTone(status)}>{status || "UNKNOWN"}</Badge>;
}

export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonGrid({ cards = 4 }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: cards }).map((_, index) => (
        <GlassCard key={index} hover={false} className="p-5">
          <Skeleton className="mb-4 h-5 w-28" />
          <Skeleton className="mb-3 h-10 w-20" />
          <Skeleton className="h-3 w-full" />
        </GlassCard>
      ))}
    </div>
  );
}

export function EmptyState({ title, message, icon: Icon }) {
  return (
    <GlassCard hover={false} className="grid min-h-56 place-items-center p-8 text-center">
      <div>
        {Icon && (
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-indigo-500/25 to-cyan-400/20 text-cyan-100">
            <Icon className="h-8 w-8" />
          </div>
        )}
        <h3 className="text-xl font-black gradient-text">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">{message}</p>
      </div>
    </GlassCard>
  );
}

export function Modal({ title, children, onClose }) {
  return (
      <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-lg p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 className="text-xl font-black text-white">{title}</h3>
          <button className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, tone = "indigo", note }) {
  return (
    <GlassCard className={`p-5 glow-${tone}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-400">{label}</p>
          <p className="mt-2 text-4xl font-black text-white">
            {value}
          </p>
        </div>
        {Icon && (
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.06] text-cyan-100">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      {note && <p className="mt-4 text-xs text-slate-500">{note}</p>}
    </GlassCard>
  );
}

export function ScoreRing({ score = 0, label = "Score" }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (safeScore / 100) * circumference;

  return (
    <div className="relative grid h-32 w-32 place-items-center">
      <svg className="-rotate-90" width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <circle
          cx="64"
          cy="64"
          r="44"
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0" x2="1">
            <stop stopColor="#6366F1" />
            <stop offset="0.5" stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-black text-white">{safeScore}</p>
        <p className="text-[11px] uppercase tracking-widest text-slate-500">{label}</p>
      </div>
    </div>
  );
}

