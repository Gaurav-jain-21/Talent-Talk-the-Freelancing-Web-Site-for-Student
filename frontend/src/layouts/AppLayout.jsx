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
  const profilePath = links.find(([label]) => label === "Profile")?.[1] || routeFallback(role);
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
        <aside className={`hidden h-screen shrink-0 border-r border-white/10 bg-[#20272a] transition-all lg:flex lg:flex-col ${collapsed ? "w-24" : "w-72"}`}>
          <div className="flex items-center justify-between gap-3 p-5">
            <Logo compact={collapsed} />
            <button className="rounded-lg p-2 text-[#c0d6df] hover:bg-[#4f6d7a]/30 hover:text-[#e8dab2]" onClick={() => setCollapsed((value) => !value)}>
              <PanelLeft className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
            {links.map(([label, href, Icon]) => (
              <NavLink
                key={label}
                to={href}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 overflow-hidden rounded-lg px-4 py-3 text-sm font-bold transition ${
                    isActiveLink(href, isActive)
                      ? "bg-[#4f6d7a]/35 text-[#e8dab2]"
                      : "text-[#c0d6df] hover:bg-white/[0.05] hover:text-[#e8dab2]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActiveLink(href, isActive) && (
                      <span className="absolute left-0 top-2 h-8 w-1 rounded-r-full bg-[#e8dab2]" />
                    )}
                    <Icon className="relative h-5 w-5" />
                    {!collapsed && <span className="relative">{label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-4">
            <div className="rounded-xl border border-white/10 bg-[#1a1d1f]/70 p-4">
              <div className="flex items-center gap-3">
                <div className="relative grid h-11 w-11 place-items-center rounded-lg bg-[#4f6d7a] font-black text-white">
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
                <button onClick={logout} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-bold text-slate-300 hover:border-rose-400/40 hover:text-rose-100">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              )}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#1a1d1f]/95 px-5 py-4 backdrop-blur lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#c0d6df]/70">{role} workspace</p>
                <h1 className="text-lg font-black text-white sm:text-2xl">Good to see you, <span className="text-[#e8dab2]">{user?.name}</span></h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Toggle payment notifications"
                  className="relative rounded-full border border-white/10 bg-[#2c3539] p-3 text-[#e8dab2] hover:bg-[#4f6d7a]"
                  onClick={() => setNotificationsOpen((value) => !value)}
                >
                  <Bell className="h-5 w-5" />
                  {successfulPayments.length > 0 && (
                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#d4af37]" />
                  )}
                </button>
                {notificationsOpen && (
                  <div className="absolute right-20 top-20 z-50 w-80 rounded-xl border border-white/10 bg-[#20272a] p-4 shadow-2xl">
                    <p className="font-black text-white">Payment notifications</p>
                    {role === "STUDENT" && successfulPayments.length ? (
                      <div className="mt-3 space-y-2">
                        {successfulPayments.slice(0, 4).map((payment) => (
                          <div key={pick(payment, ["id"])} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                            <p className="font-bold text-white">{formatCurrency(pick(payment, ["amount"], 0))} received</p>
                            <p className="text-xs text-slate-400">From {pick(payment, ["companyName"], "Company")} for {pick(payment, ["jobTitle"], "work")}</p>
                          </div>
                        ))}
                        <Link to="/student/payments" onClick={() => setNotificationsOpen(false)} className="block rounded-lg border border-[#e8dab2]/30 px-3 py-2 text-center text-sm font-bold text-[#e8dab2]">
                          Open payments
                        </Link>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">No payment notifications yet.</p>
                    )}
                  </div>
                )}
                <Link to={profilePath} className="rounded-full border border-white/10 bg-[#2c3539] p-3 text-[#e8dab2] hover:bg-[#4f6d7a]" aria-label="Open profile settings">
                  <Settings className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-5 lg:p-8">
            <Outlet />
          </div>
        </div>
      </div>
      <div className="fixed bottom-4 left-4 right-4 z-40 rounded-xl border border-white/10 bg-[#1a1d1f]/95 p-2 backdrop-blur lg:hidden">
        <div className="flex gap-2 overflow-x-auto">
          {links.map(([label, href, Icon]) => (
            <NavLink key={label} to={href} className={({ isActive }) => `grid min-w-16 place-items-center rounded-lg px-3 py-2.5 ${isActive ? "bg-[#4f6d7a]/35 text-[#e8dab2]" : "text-[#c0d6df]/70"}`} title={label} aria-label={label}>
              <Icon className="h-5 w-5" />
              <span className="mt-1 max-w-14 truncate text-[10px] font-bold">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </MeshBackground>
  );
}

function routeFallback(role) {
  if (role === "COMPANY") return "/company/profile";
  if (role === "ADMIN") return "/admin/dashboard";
  return "/student/profile";
}
