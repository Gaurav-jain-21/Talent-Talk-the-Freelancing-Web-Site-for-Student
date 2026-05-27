import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  ClipboardList,
  CreditCard,
  Gauge,
  LogOut,
  MessageSquareText,
  PanelLeft,
  PlusCircle,
  Settings,
  ShieldCheck,
  Users,
  UserRound,
  Workflow,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { paymentApi } from "../api/services";
import { asArray, formatCurrency, initials, pick } from "../utils/format";
import { useAsync } from "../utils/useAsync";
import { Logo } from "../components/ui/Primitives";
import { MeshBackground } from "../components/ui/Background";

const nav = {
  STUDENT: [
    ["Dashboard", "/student/dashboard", Gauge],
    ["Browse Jobs", "/student/jobs", BriefcaseBusiness],
    ["Applications", "/student/applications", ClipboardList],
    ["Works", "/student/works", Workflow],
    ["Payments", "/student/payments", CreditCard],
    ["Messages", "/student/chat", MessageSquareText],
    ["Profile", "/student/profile", UserRound],
  ],
  COMPANY: [
    ["Dashboard", "/company/dashboard", Gauge],
    ["Applications", "/company/applications", ClipboardList],
    ["Post Job", "/company/jobs/post", PlusCircle],
    ["My Jobs", "/company/jobs", BriefcaseBusiness],
    ["Students", "/company/students", Users],
    ["Interviews", "/company/interviews", CalendarClock],
    ["Payments", "/company/payments", CreditCard],
    ["Messages", "/company/chat", MessageSquareText],
    ["Profile", "/company/profile", Building2],
  ],
  ADMIN: [
    ["Dashboard", "/admin/dashboard", ShieldCheck],
    ["Students", "/admin/students", Users],
    ["Companies", "/admin/companies", Building2],
    ["Jobs", "/admin/jobs", BriefcaseBusiness],
    ["Payments", "/admin/payments", CreditCard],
  ],
};

export default function AppLayout({ role }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const links = nav[role] || [];
  const paymentNotifications = useAsync(
    () => (role === "STUDENT" && user?.userId ? paymentApi.student(user.userId) : Promise.resolve([])),
    [role, user?.userId],
    { toast: false },
  );
  const successfulPayments = asArray(paymentNotifications.data).filter(
    (payment) => String(pick(payment, ["status"], "")).toUpperCase() === "SUCCESS",
  );
  const isActiveLink = (href, isActive) =>
    isActive ||
    location.pathname === href ||
    (href === "/company/applications" && location.pathname.startsWith("/company/applications"));

  return (
    <MeshBackground>
      <div className="flex h-screen overflow-hidden">
        <aside className={`hidden h-screen shrink-0 border-r border-white/10 bg-[#1a1d1f]/95 backdrop-blur-2xl transition-all lg:flex lg:flex-col ${collapsed ? "w-24" : "w-72"}`}>
          <div className="flex items-center justify-between gap-3 p-6">
            <Logo compact={collapsed} />
            <button className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white" onClick={() => setCollapsed((value) => !value)}>
              <PanelLeft className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
            {links.map(([label, href, Icon]) => (
              <NavLink
                key={label}
                to={href}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    isActiveLink(href, isActive)
                      ? "bg-[#4f6d7a]/25 text-[#e8dab2]"
                      : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActiveLink(href, isActive) && (
                      <span className="absolute left-0 top-2 h-8 w-1 rounded-r bg-[#e8dab2]" />
                    )}
                    <Icon className="relative h-5 w-5" />
                    {!collapsed && <span className="relative">{label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-4">
            <div className="rounded-xl border border-white/10 bg-[#2c3539]/70 p-4">
              <div className="flex items-center gap-3">
                <div className="relative grid h-11 w-11 place-items-center rounded-full bg-[#4f6d7a] font-black text-white">
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

        <div className="min-w-0 flex flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 border-b border-[#c0d6df]/10 bg-[#1a1d1f]/95 px-5 py-4 backdrop-blur-2xl lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Talent Talk</p>
                <h1 className="text-lg font-black text-white sm:text-2xl">Good to see you, <span className="gradient-text">{user?.name}</span></h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-slate-300 hover:text-white"
                  onClick={() => setNotificationsOpen((value) => !value)}
                >
                  <Bell className="h-5 w-5" />
                  {successfulPayments.length > 0 && (
                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(6,182,212,0.8)]" />
                  )}
                </button>
                {notificationsOpen && (
                  <div className="absolute right-20 top-20 z-50 w-80 rounded-xl border border-white/10 bg-[#2c3539]/95 p-4 shadow-2xl backdrop-blur-2xl">
                    <p className="font-black text-white">Payment notifications</p>
                    {role === "STUDENT" && successfulPayments.length ? (
                      <div className="mt-3 space-y-2">
                        {successfulPayments.slice(0, 4).map((payment) => (
                          <div key={pick(payment, ["id"])} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                            <p className="font-bold text-white">{formatCurrency(pick(payment, ["amount"], 0))} received</p>
                            <p className="text-xs text-slate-400">From {pick(payment, ["companyName"], "Company")} for {pick(payment, ["jobTitle"], "work")}</p>
                          </div>
                        ))}
                        <Link to="/student/payments" onClick={() => setNotificationsOpen(false)} className="block rounded-2xl border border-cyan-300/30 px-3 py-2 text-center text-sm font-bold text-cyan-100">
                          Open payments
                        </Link>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">No payment notifications yet.</p>
                    )}
                  </div>
                )}
                <button className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-slate-300 hover:text-white">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-5 lg:p-8">
            <Outlet />
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 gap-1 border-t border-[#c0d6df]/10 bg-[#1a1d1f]/95 p-2 backdrop-blur-2xl lg:hidden">
        {links.slice(0, 5).map(([label, href, Icon]) => (
          <NavLink key={label} to={href} className={({ isActive }) => `grid place-items-center rounded-lg p-3 ${isActive ? "text-[#e8dab2]" : "text-[#c0d6df]"}`} title={label}>
            <Icon className="h-5 w-5" />
          </NavLink>
        ))}
      </div>
    </MeshBackground>
  );
}
