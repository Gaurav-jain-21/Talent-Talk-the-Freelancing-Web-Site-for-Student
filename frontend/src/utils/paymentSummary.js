import { asArray, moneyFromText, pick } from "./format";

export function successfulPayments(payments) {
  return asArray(payments).filter(
    (payment) => String(pick(payment, ["status"], "")).toUpperCase() === "SUCCESS",
  );
}

export function paidForApplication(payments, applicationId) {
  return successfulPayments(payments)
    .filter((payment) => String(pick(payment, ["applicationId"])) === String(applicationId))
    .reduce((sum, payment) => sum + Number(pick(payment, ["amount"], 0)), 0);
}

export function expectedAmountForJob(job) {
  return moneyFromText(pick(job, ["salary", "amount", "budget"], 0));
}

export function remainingForApplication(payments, applicationId, job) {
  return Math.max(0, expectedAmountForJob(job) - paidForApplication(payments, applicationId));
}

export function paymentTotals(items, payments) {
  return items.reduce(
    (totals, item) => {
      const applicationId = pick(item.application, ["id", "applicationId"]);
      const expected = expectedAmountForJob(item.job);
      const paid = paidForApplication(payments, applicationId);
      totals.expected += expected;
      totals.paid += paid;
      totals.remaining += Math.max(0, expected - paid);
      return totals;
    },
    { expected: 0, paid: 0, remaining: 0 },
  );
}
