import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  ClipboardList,
  Gauge,
  LogOut,
  MessageSquareText,
  PanelLeft,
  PlusCircle,
  Settings,
  ShieldCheck,
  Users,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { initials } from "../utils/format";
import { Logo } from "../components/ui/Primitives";
import { MeshBackground } from "../components/ui/Background";

const nav = {
  STUDENT: [
    ["Dashboard", "/student/dashboard", Gauge],
    ["Browse Jobs", "/student/jobs", BriefcaseBusiness],
    ["Applications", "/student/applications", ClipboardList],
    ["Interviews", "/student/dashboard", CalendarClock],
    ["Messages", "/student/chat", MessageSquareText],
    ["Profile", "/student/profile", UserRound],
  ],
  COMPANY: [
    ["Dashboard", "/company/dashboard", Gauge],
    ["Post Job", "/company/jobs/post", PlusCircle],
    ["My Jobs", "/company/jobs", BriefcaseBusiness],
    ["Students", "/company/students", Users],
    ["Interviews", "/company/interviews", CalendarClock],
    ["Messages", "/company/chat", MessageSquareText],
    ["Profile", "/company/dashboard", Building2],
  ],
  ADMIN: [
    ["Dashboard", "/admin/dashboard", ShieldCheck],
    ["Students", "/admin/students", Users],
    ["Jobs", "/admin/jobs", BriefcaseBusiness],
  ],
};

export default function AppLayout({ role }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const links = nav[role] || [];

  return (
    <MeshBackground>
      <div className="flex min-h-screen">
        <aside className={`sticky top-0 hidden h-screen shrink-0 border-r border-white/10 bg-slate-950/55 backdrop-blur-2xl transition-all lg:flex lg:flex-col ${collapsed ? "w-24" : "w-72"}`}>
          <div className="flex items-center justify-between gap-3 p-6">
            <Logo compact={collapsed} />
            <button className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white" onClick={() => setCollapsed((value) => !value)}>
              <PanelLeft className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-2 px-4">
            {links.map(([label, href, Icon]) => (
              <NavLink
                key={label}
                to={href}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    isActive || location.pathname === href
                      ? "bg-indigo-500/15 text-white shadow-[0_0_28px_rgba(99,102,241,0.18)]"
                      : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {(isActive || location.pathname === href) && (
                      <motion.span layoutId={`${role}-nav`} className="absolute left-0 top-2 h-8 w-1 rounded-full bg-cyan-300 shadow-[0_0_22px_rgba(6,182,212,0.75)]" />
                    )}
                    <Icon className="relative h-5 w-5" />
                    {!collapsed && <span className="relative">{label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3">
                <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 font-black text-white">
                  {initials(user?.name)}
                  <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
                </div>
                {!collapsed && (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{user?.name}</p>
                    <p className="text-xs text-slate-500">{role}</p>
                  </div>
                )}
              </div>
              {!collapsed && (
                <button onClick={logout} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-bold text-slate-300 hover:border-rose-400/40 hover:text-rose-100">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              )}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/45 px-5 py-4 backdrop-blur-2xl lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Talent Talk</p>
                <h1 className="text-lg font-black text-white sm:text-2xl">Good to see you, <span className="gradient-text">{user?.name}</span></h1>
              </div>
              <div className="flex items-center gap-2">
                <button className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-slate-300 hover:text-white">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(6,182,212,0.8)]" />
                </button>
                <button className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-slate-300 hover:text-white">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>
          <div className="p-5 lg:p-8">
            <Outlet />
          </div>
        </div>
      </div>
      <div className="fixed bottom-4 left-4 right-4 z-40 grid grid-cols-5 gap-2 rounded-3xl border border-white/10 bg-slate-950/80 p-2 backdrop-blur-2xl lg:hidden">
        {links.slice(0, 5).map(([label, href, Icon]) => (
          <NavLink key={label} to={href} className={({ isActive }) => `grid place-items-center rounded-2xl p-3 ${isActive ? "bg-indigo-500/20 text-cyan-100" : "text-slate-500"}`} title={label}>
            <Icon className="h-5 w-5" />
          </NavLink>
        ))}
      </div>
    </MeshBackground>
  );
}
