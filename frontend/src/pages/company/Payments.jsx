import { CreditCard, ReceiptText } from "lucide-react";
import { paymentApi } from "../../api/services";
import { Badge, EmptyState, GlassCard, SkeletonGrid, StatCard, StatusBadge } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { useAuth } from "../../context/useAuth";
import { loadCompanyApplicationGroups, flattenCompanyApplications } from "../../utils/companyApplications";
import { asArray, formatCurrency, formatDate, pick } from "../../utils/format";
import { expectedAmountForJob, paidForApplication, paymentTotals, remainingForApplication } from "../../utils/paymentSummary";
import { useAsync } from "../../utils/useAsync";

async function loadCompanyPayments(companyId) {
  const [groups, payments] = await Promise.all([
    loadCompanyApplicationGroups(companyId),
    paymentApi.company(companyId),
  ]);
  const items = flattenCompanyApplications(groups).filter(({ application }) =>
    ["SELECTED", "PAID"].includes(String(pick(application, ["status"], "")).toUpperCase()),
  );
  return { items, payments: asArray(payments) };
}

export default function CompanyPayments() {
  const { user } = useAuth();
  const query = useAsync(() => loadCompanyPayments(user.userId), [user.userId]);
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
        <p className="mt-2 text-slate-400">Track student payouts for completed selected work.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard label="Total Payable" value={formatCurrency(totals.expected)} icon={CreditCard} tone="indigo" />
        <StatCard label="Already Paid" value={formatCurrency(totals.paid)} icon={ReceiptText} tone="green" />
        <StatCard label="Remaining" value={formatCurrency(totals.remaining)} icon={CreditCard} tone="yellow" />
      </div>

      {items.length ? (
        <GlassCard hover={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">Work</th>
                  <th className="px-5 py-4">Work Status</th>
                  <th className="px-5 py-4">Payable</th>
                  <th className="px-5 py-4">Paid</th>
                  <th className="px-5 py-4">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {items.map((item) => {
                  const expected = expectedAmountForJob(item.job);
                  const paid = paidForApplication(payments, item.applicationId);
                  const remaining = remainingForApplication(payments, item.applicationId, item.job);
                  return (
                    <tr key={item.applicationId} className="transition hover:bg-white/[0.03]">
                      <td className="px-5 py-4">
                        <p className="font-black text-white">{pick(item.application, ["studentName", "name"], "Student")}</p>
                        <p className="text-sm text-slate-500">{pick(item.application, ["studentEmail", "email"], "")}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{pick(item.application, ["projectTitle"], pick(item.job, ["title"], "Work"))}</p>
                        <p className="text-sm text-slate-500">{pick(item.job, ["companyName"], "")}</p>
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={pick(item.application, ["workStatus"], "IN_PROGRESS")} /></td>
                      <td className="px-5 py-4 text-slate-300">{formatCurrency(expected)}</td>
                      <td className="px-5 py-4 text-emerald-200">{formatCurrency(paid)}</td>
                      <td className="px-5 py-4">
                        <Badge tone={remaining > 0 ? "yellow" : "green"}>{formatCurrency(remaining)}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      ) : (
        <EmptyState icon={CreditCard} title="No payable work yet" message="Selected students will appear here once their work is assigned." />
      )}

      {payments.length > 0 && (
        <GlassCard hover={false} className="p-5">
          <h3 className="text-xl font-black text-white">Payment History</h3>
          <div className="mt-4 grid gap-3">
            {payments.map((payment) => (
              <div key={pick(payment, ["id"])} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[1fr_auto_auto]">
                <div>
                  <p className="font-bold text-white">{pick(payment, ["studentName"], "Student")}</p>
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
