import { useMemo, useState } from "react";
import { CreditCard } from "lucide-react";
import { adminApi, paymentApi } from "../../api/services";
import { Badge, EmptyState, GlassCard, SearchBox, StatCard, StatusBadge } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { asArray, errorMessage, formatCurrency, formatDate, pick } from "../../utils/format";
import { useAsync } from "../../utils/useAsync";

export default function ManagePayments() {
  const [query, setQuery] = useState("");
  const result = useAsync(async () => {
    try {
      return await paymentApi.all();
    } catch {
      return adminApi.payments();
    }
  }, []);
  const payments = asArray(result.data);
  const filtered = useMemo(() => payments.filter((payment) => JSON.stringify(payment).toLowerCase().includes(query.toLowerCase())), [payments, query]);
  const total = payments.reduce((sum, payment) => sum + Number(pick(payment, ["amount"], 0)), 0);
  const successful = payments.filter((payment) => String(pick(payment, ["status"], "")).toUpperCase() === "SUCCESS");
  const successTotal = successful.reduce((sum, payment) => sum + Number(pick(payment, ["amount"], 0)), 0);

  return (
    <Page className="space-y-6">
      <div>
        <h2 className="text-4xl font-black gradient-text">Payment Transactions</h2>
        <p className="mt-2 text-slate-400">All payment records are loaded from payment-service database.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard label="Transactions" value={payments.length} icon={CreditCard} />
        <StatCard label="Successful" value={successful.length} icon={CreditCard} tone="green" />
        <StatCard label="Success Value" value={formatCurrency(successTotal)} icon={CreditCard} tone="cyan" />
      </div>
      <SearchBox value={query} onChange={setQuery} placeholder="Search transactions" />
      {result.error && (
        <EmptyState
          icon={CreditCard}
          title="Payments could not load"
          message={errorMessage(result.error)}
        />
      )}
      {!result.error && filtered.length ? (
        <GlassCard hover={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-5 py-4">Payment</th><th className="px-5 py-4">Company</th><th className="px-5 py-4">Student</th><th className="px-5 py-4">Job</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Date</th></tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((payment) => (
                  <tr key={pick(payment, ["id"])} className="hover:bg-cyan-400/5">
                    <td className="px-5 py-4"><p className="font-bold text-white">#{pick(payment, ["id"], "-")}</p><p className="text-xs text-slate-500">{pick(payment, ["razorpayPaymentId", "razorpayOrderId"], "")}</p></td>
                    <td className="px-5 py-4"><p className="text-slate-300">{pick(payment, ["companyName"], "Company")}</p><p className="text-xs text-slate-500">ID {pick(payment, ["companyId"], "-")}</p></td>
                    <td className="px-5 py-4"><p className="text-slate-300">{pick(payment, ["studentName"], "Student")}</p><p className="text-xs text-slate-500">ID {pick(payment, ["studentId"], "-")}</p></td>
                    <td className="px-5 py-4 text-slate-400">{pick(payment, ["jobTitle", "jobId"], "Job")}</td>
                    <td className="px-5 py-4 font-black text-white">{formatCurrency(pick(payment, ["amount"], 0), pick(payment, ["currency"], "INR"))}</td>
                    <td className="px-5 py-4"><StatusBadge status={pick(payment, ["status"], "CREATED")} /></td>
                    <td className="px-5 py-4 text-sm text-slate-400">{formatDate(pick(payment, ["createdAt"]))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      ) : !result.error ? (
        <EmptyState icon={CreditCard} title="No payment transactions" message="Payment records will appear here after companies create Razorpay payments." />
      ) : null}
      <Badge tone="slate">Total attempted value {formatCurrency(total)}</Badge>
    </Page>
  );
}
