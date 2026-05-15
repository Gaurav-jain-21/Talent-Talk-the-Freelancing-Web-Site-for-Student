import { CreditCard, ReceiptText } from "lucide-react";
import { jobApi, paymentApi } from "../../api/services";
import { Badge, EmptyState, GlassCard, SkeletonGrid, StatCard, StatusBadge } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { useAuth } from "../../context/useAuth";
import { asArray, formatCurrency, formatDate, pick } from "../../utils/format";
import { expectedAmountForJob, paidForApplication, paymentTotals, remainingForApplication } from "../../utils/paymentSummary";
import { useAsync } from "../../utils/useAsync";

async function loadStudentPayments(studentId) {
  const [applications, payments] = await Promise.all([
    jobApi.studentApplications(studentId),
    paymentApi.student(studentId),
  ]);

  const selected = await Promise.all(
    asArray(applications)
      .filter((application) => ["SELECTED", "PAID"].includes(String(pick(application, ["status"], "")).toUpperCase()))
      .map(async (application) => {
        const jobId = pick(application, ["jobId"]);
        try {
          return { application, jobId, job: jobId ? await jobApi.byId(jobId) : null };
        } catch {
          return { application, jobId, job: null };
        }
      }),
  );

  return { items: selected, payments: asArray(payments) };
}

export default function StudentPayments() {
  const { user } = useAuth();
  const query = useAsync(() => loadStudentPayments(user.userId), [user.userId]);
  const items = query.data?.items || [];
  const payments = query.data?.payments || [];
  const totals = paymentTotals(items, payments);

  if (query.loading) {
    return <Page className="space-y-6"><SkeletonGrid cards={3} /></Page>;
  }

  return (
    <Page className="space-y-6">
      <div>
        <h2 className="text-4xl font-black gradient-text">Payments</h2>
        <p className="mt-2 text-slate-400">See received money and pending payouts from companies.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard label="Expected" value={formatCurrency(totals.expected)} icon={CreditCard} tone="indigo" />
        <StatCard label="Received" value={formatCurrency(totals.paid)} icon={ReceiptText} tone="green" />
        <StatCard label="Remaining" value={formatCurrency(totals.remaining)} icon={CreditCard} tone="yellow" />
      </div>

      {items.length ? (
        <GlassCard hover={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Company</th>
                  <th className="px-5 py-4">Work</th>
                  <th className="px-5 py-4">Work Status</th>
                  <th className="px-5 py-4">Expected</th>
                  <th className="px-5 py-4">Received</th>
                  <th className="px-5 py-4">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {items.map((item) => {
                  const applicationId = pick(item.application, ["id", "applicationId"]);
                  const expected = expectedAmountForJob(item.job);
                  const paid = paidForApplication(payments, applicationId);
                  const remaining = remainingForApplication(payments, applicationId, item.job);
                  return (
                    <tr key={applicationId || item.jobId} className="transition hover:bg-white/[0.03]">
                      <td className="px-5 py-4 font-black text-white">{pick(item.job, ["companyName", "company"], "Company")}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{pick(item.application, ["projectTitle"], pick(item.job, ["title"], "Work"))}</p>
                        <p className="text-sm text-slate-500">Selected {formatDate(pick(item.application, ["updatedAt", "appliedAt"]))}</p>
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={pick(item.application, ["workStatus"], "IN_PROGRESS")} /></td>
                      <td className="px-5 py-4 text-slate-300">{formatCurrency(expected)}</td>
                      <td className="px-5 py-4 text-emerald-200">{formatCurrency(paid)}</td>
                      <td className="px-5 py-4"><Badge tone={remaining > 0 ? "yellow" : "green"}>{formatCurrency(remaining)}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      ) : (
        <EmptyState icon={CreditCard} title="No payment records yet" message="Completed selected work and company payments will appear here." />
      )}

      {payments.length > 0 && (
        <GlassCard hover={false} className="p-5">
          <h3 className="text-xl font-black text-white">Received Notifications</h3>
          <div className="mt-4 grid gap-3">
            {payments.map((payment) => (
              <div key={pick(payment, ["id"])} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[1fr_auto_auto]">
                <div>
                  <p className="font-bold text-white">{pick(payment, ["companyName"], "Company")}</p>
                  <p className="text-sm text-slate-500">{pick(payment, ["jobTitle"], "Work")} • {formatDate(pick(payment, ["createdAt"]))}</p>
                </div>
                <StatusBadge status={pick(payment, ["status"], "CREATED")} />
                <p className="font-black text-white">{formatCurrency(pick(payment, ["amount"], 0))}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </Page>
  );
}
