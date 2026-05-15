import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { CreditCard, ExternalLink, Users } from "lucide-react";
import { paymentApi } from "../../api/services";
import {
  Badge,
  EmptyState,
  GhostButton,
  GlassCard,
  GradientButton,
  SearchBox,
  Skeleton,
  StatusBadge,
} from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { useAuth } from "../../context/useAuth";
import { loadCompanyApplicationGroups, flattenCompanyApplications } from "../../utils/companyApplications";
import { errorMessage, formatCurrency, formatDate, pick } from "../../utils/format";
import { openRazorpayCheckout } from "../../utils/razorpay";
import { expectedAmountForJob, paidForApplication, remainingForApplication } from "../../utils/paymentSummary";
import { useAsync } from "../../utils/useAsync";

function workTone(status) {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "COMPLETED") return "green";
  if (normalized === "IN_PROGRESS") return "yellow";
  return "slate";
}

function workLabel(status) {
  return String(status || "IN_PROGRESS").replaceAll("_", " ");
}

export default function StudentList() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [payingId, setPayingId] = useState("");
  const result = useAsync(() => loadCompanyApplicationGroups(user.userId), [user.userId]);
  const paymentsQuery = useAsync(() => paymentApi.company(user.userId), [user.userId], { toast: false });
  const { refresh } = result;

  useEffect(() => {
    const interval = window.setInterval(() => {
      refresh();
    }, 10000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const selectedStudents = useMemo(
    () =>
      flattenCompanyApplications(result.data || [])
        .filter(({ application }) => String(pick(application, ["status"], "")).toUpperCase() === "SELECTED")
        .map((item) => ({
          ...item,
          workStatus: pick(item.application, ["workStatus"], "IN_PROGRESS"),
          projectTitle: pick(item.application, ["projectTitle"], pick(item.job, ["title", "jobTitle"], "Assigned project")),
        })),
    [result.data],
  );
  const payments = useMemo(() => paymentsQuery.data || [], [paymentsQuery.data]);
  const filtered = useMemo(
    () =>
      selectedStudents
        .filter((item) => remainingForApplication(payments, item.applicationId, item.job) > 0)
        .filter((item) =>
          JSON.stringify({ application: item.application, job: item.job, projectTitle: item.projectTitle })
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
    [payments, query, selectedStudents],
  );
  const completed = selectedStudents.filter((item) => String(item.workStatus).toUpperCase() === "COMPLETED").length;

  async function payStudent(item) {
    const remaining = remainingForApplication(payments, item.applicationId, item.job);
    if (!remaining || remaining < 1) {
      toast.error("No remaining payment amount for this student.");
      return;
    }

    setPayingId(String(item.applicationId));
    try {
      toast.loading("Opening Razorpay checkout...", { id: "razorpay-open" });
      const keyResponse = await paymentApi.key();
      const key = pick(keyResponse, ["key"], import.meta.env.VITE_RAZORPAY_KEY_ID || "");
      if (!key) {
        throw new Error("Razorpay key is missing from payment service.");
      }

      const order = await paymentApi.create({
        companyId: user.userId,
        jobId: item.jobId,
        applicationId: item.applicationId,
        studentId: pick(item.application, ["studentId", "userId"]),
        companyName: user.name,
        studentName: pick(item.application, ["studentName", "name"], "Student"),
        jobTitle: item.projectTitle,
        amount: remaining,
      });
      const orderId = pick(order, ["razorpayOrderId"], "");
      if (!orderId) {
        throw new Error("Razorpay order was not created. Please check payment-service.");
      }

      toast.dismiss("razorpay-open");
      const razorpayResponse = await openRazorpayCheckout({
        key,
        amount: Math.round(Number(order.amount) * 100),
        currency: pick(order, ["currency"], "INR"),
        name: "Talent Talk",
        description: `Payment for ${item.projectTitle}`,
        order_id: orderId,
        prefill: {
          name: user.name,
        },
        notes: {
          applicationId: String(item.applicationId),
          studentId: String(pick(item.application, ["studentId", "userId"])),
          jobId: String(item.jobId),
        },
      });

      const verified = await paymentApi.verify({
        razorpayOrderId: razorpayResponse.razorpay_order_id,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpaySignature: razorpayResponse.razorpay_signature,
      });
      if (String(pick(verified, ["status"], "")).toUpperCase() !== "SUCCESS") {
        throw new Error("Payment verification failed.");
      }

      toast.success("Payment completed");
      paymentsQuery.refresh();
      result.refresh();
    } catch (error) {
      toast.dismiss("razorpay-open");
      toast.error(errorMessage(error));
    } finally {
      setPayingId("");
    }
  }

  if (result.loading) {
    return (
      <Page className="space-y-6">
        <h2 className="text-4xl font-black gradient-text">Selected Students</h2>
        <Skeleton className="h-96 rounded-[2rem]" />
      </Page>
    );
  }

  return (
    <Page className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black gradient-text">Selected Students</h2>
            <p className="mt-2 text-slate-400">
              {selectedStudents.length} selected students, {completed} completed work items.
            </p>
          </div>
          <Badge tone="cyan">
            <Users className="h-3 w-3" /> Company hires
          </Badge>
        </div>
        <div className="mt-6">
          <SearchBox value={query} onChange={setQuery} placeholder="Search student, project, job, or status" />
        </div>
      </section>

      {filtered.length ? (
        <GlassCard hover={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">Project / Job</th>
                  <th className="px-5 py-4">Applied</th>
                  <th className="px-5 py-4">Application</th>
                  <th className="px-5 py-4">Work Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((item) => {
                  const application = item.application;
                  const isCompleted = String(item.workStatus).toUpperCase() === "COMPLETED";
                  const expected = expectedAmountForJob(item.job);
                  const paid = paidForApplication(payments, item.applicationId);
                  const remaining = remainingForApplication(payments, item.applicationId, item.job);
                  const paymentComplete = expected > 0 && remaining === 0;
                  return (
                    <tr key={item.applicationId} className="transition hover:bg-white/[0.03]">
                      <td className="px-5 py-4">
                        <p className="font-black text-white">{pick(application, ["studentName", "name"], "Student")}</p>
                        <p className="text-sm text-slate-500">{pick(application, ["studentEmail", "email"], "")}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{item.projectTitle}</p>
                        <p className="text-sm text-slate-500">{pick(item.job, ["location"], "")}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-400">
                        {formatDate(pick(application, ["appliedAt", "appliedDate", "createdAt"]))}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={pick(application, ["status"], "SELECTED")} />
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={workTone(item.workStatus)}>{workLabel(item.workStatus)}</Badge>
                        <p className="mt-1 text-xs text-slate-500">
                          Paid {formatCurrency(paid)} / {formatCurrency(expected)}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link to={`/company/applications/${item.applicationId}`}>
                            <GhostButton className="px-3">
                              <ExternalLink className="h-4 w-4" /> Details
                            </GhostButton>
                          </Link>
                          <GradientButton
                            disabled={!isCompleted || paymentComplete || expected < 1}
                            loading={payingId === String(item.applicationId)}
                            className="px-3"
                            onClick={() => payStudent(item)}
                          >
                            <CreditCard className="h-4 w-4" /> {paymentComplete ? "Paid" : "Payment"}
                          </GradientButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      ) : (
        <EmptyState
          icon={Users}
          title="No selected students found"
          message="Students will appear here after you accept applications from the Applications section."
        />
      )}
    </Page>
  );
}
