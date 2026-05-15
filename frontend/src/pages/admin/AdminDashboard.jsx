import { Activity, BriefcaseBusiness, Server, Users } from "lucide-react";
import { adminApi } from "../../api/services";
import { Badge, EmptyState, GlassCard, SkeletonGrid, StatCard } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { asArray, pick } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

export default function AdminDashboard() {
  const query = useAsync(() => adminApi.dashboard(), []);
  const data = query.data || {};
  const services = asArray(pick(data, ["services", "health"], []));
  const activity = asArray(pick(data, ["recentActivity", "activity"], []));

  return (
    <Page className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-600/25 via-purple-600/15 to-cyan-500/10 p-8">
        <Badge tone="cyan">Admin control plane</Badge>
        <h2 className="mt-4 text-5xl font-black gradient-text">Talent Talk Operations</h2>
      </section>
      {query.loading ? (
        <SkeletonGrid cards={4} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Students" value={pick(data, ["totalStudents", "students", "studentCount"], 0)} icon={Users} />
          <StatCard label="Jobs" value={pick(data, ["totalJobs", "jobs", "jobCount"], 0)} icon={BriefcaseBusiness} tone="cyan" />
          <StatCard label="Companies" value={pick(data, ["totalCompanies", "companies", "companyCount"], 0)} icon={Activity} tone="green" />
          <StatCard label="Services" value={services.length} icon={Server} tone="yellow" />
        </div>
      )}
      <section className="grid gap-5 xl:grid-cols-2">
        <GlassCard hover={false} className="p-6">
          <h3 className="mb-5 text-xl font-black text-white">Service Health</h3>
          {services.length ? services.map((service) => (
            <div key={pick(service, ["name", "service"])} className="mb-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="font-bold text-white">{pick(service, ["name", "service"], "Service")}</span>
              <span className="flex items-center gap-2 text-sm text-emerald-300"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.7)]" /> Healthy</span>
            </div>
          )) : <EmptyState icon={Server} title="No health data" message="The admin API did not return service health yet." />}
        </GlassCard>
        <GlassCard hover={false} className="p-6">
          <h3 className="mb-5 text-xl font-black text-white">Recent Activity</h3>
          {activity.length ? activity.map((item, index) => (
            <div key={pick(item, ["id"], index)} className="mb-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-bold text-white">{pick(item, ["title", "event"], "Activity")}</p>
              <p className="text-sm text-slate-500">{pick(item, ["description", "message"], "")}</p>
            </div>
          )) : <EmptyState icon={Activity} title="No recent activity" message="Operational events will stream into this feed." />}
        </GlassCard>
      </section>
    </Page>
  );
}
